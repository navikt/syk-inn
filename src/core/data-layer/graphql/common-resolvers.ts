import { logger } from '@navikt/next-logger'
import { GraphQLError } from 'graphql/error'
import * as R from 'remeda'

import { getFlag, getUserlessToggles, getUserToggles } from '@core/toggles/unleash'
import { QueryResolvers, Resolvers, UtdypendeSporsmalOptions } from '@resolvers'
import { CommonGraphqlContext } from '@data-layer/graphql/common-context'
import { searchDiagnose } from '@data-layer/common/diagnose-search'
import { aaregService } from '@core/services/aareg/aareg-service'
import { sykInnApiService } from '@core/services/syk-inn-api/syk-inn-api-service'
import {
    calculateTotalLengthOfSykmeldinger,
    filterSykmeldingerWithinDaysGap,
    mapSykInnApiSykmeldingerToDateRanges,
} from '@data-layer/common/continuous-sykefravaer-utils'

export const commonQueryResolvers: QueryResolvers<CommonGraphqlContext> = {
    diagnose: (_, { query, systems }) => searchDiagnose(query, systems),
}

export const commonObjectResolvers: Resolvers<CommonGraphqlContext> = {
    Pasient: {
        arbeidsforhold: async (pasient) => {
            const aaregToggle = getFlag('SYK_INN_AAREG', await getUserlessToggles())
            if (!aaregToggle) {
                logger.error(
                    'SYK_INN_AAREG flag is not enabled, why are you calling this? Remember to feature toggle your frontend as well.',
                )
                return []
            }

            return await aaregService.getArbeidsforhold(pasient.ident)
        },
        utdypendeSporsmal: async (pasient, _args, { hpr }) => {
            const sykInnSykmeldinger = await sykInnApiService.getSykmeldinger(pasient.ident, hpr)
            if ('errorType' in sykInnSykmeldinger) {
                throw new GraphQLError('API_ERROR')
            }

            // TODO la utdypendespørsmål basere seg på alle sykmeldinger, ikke bare egen behandler
            const showRedactedFlag = getFlag('SYK_INN_SHOW_REDACTED', await getUserToggles(hpr))

            const sykmeldinger = R.pipe(
                sykInnSykmeldinger,
                R.filter((it) => showRedactedFlag || it.kind !== 'redacted'),
            )

            const sykmeldingDateRanges = mapSykInnApiSykmeldingerToDateRanges(sykmeldinger)
            const totalDays = R.pipe(
                sykmeldingDateRanges,
                filterSykmeldingerWithinDaysGap,
                calculateTotalLengthOfSykmeldinger,
            )
            const latestTom = R.sortBy(sykmeldingDateRanges, [(it) => it.latestTom, 'desc'])[0]?.latestTom ?? null

            const previouslyAnsweredSporsmal: UtdypendeSporsmalOptions[] = []
            sykmeldinger.forEach((sykmelding) => {
                if (sykmelding.kind === 'full' && sykmelding.values.utdypendeSporsmalSvar) {
                    if (sykmelding.values.utdypendeSporsmalSvar.utfordringerMedArbeid?.svar) {
                        previouslyAnsweredSporsmal.push('UTFORDRINGER_MED_ARBEID')
                    }
                    if (sykmelding.values.utdypendeSporsmalSvar.medisinskOppsummering?.svar) {
                        previouslyAnsweredSporsmal.push('MEDISINSK_OPPSUMMERING')
                    }
                }
                if (sykmelding.kind === 'full' && sykmelding.values.utdypendeSporsmal) {
                    if (
                        sykmelding.values.utdypendeSporsmal.utfordringerMedArbeid &&
                        !previouslyAnsweredSporsmal.includes('UTFORDRINGER_MED_ARBEID')
                    ) {
                        previouslyAnsweredSporsmal.push('UTFORDRINGER_MED_ARBEID')
                    }
                    if (
                        sykmelding.values.utdypendeSporsmal.medisinskOppsummering &&
                        !previouslyAnsweredSporsmal.includes('MEDISINSK_OPPSUMMERING')
                    ) {
                        previouslyAnsweredSporsmal.push('MEDISINSK_OPPSUMMERING')
                    }
                }
            })

            return { days: totalDays, latestTom, previouslyAnsweredSporsmal }
        },
    },
}
