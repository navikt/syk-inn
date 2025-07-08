import { logger } from '@navikt/next-logger'
import { startTransition } from 'react'
import { useRouter } from 'next/navigation'
import { FetchResult, MutationResult, useMutation } from '@apollo/client'
import { teamLogger } from '@navikt/next-logger/team-log'

import { raise } from '@utils/ts'
import { pathWithBasePath } from '@utils/url'
import {
    AllSykmeldingerDocument,
    GetAllDraftsDocument,
    InputAktivitet,
    OpprettSykmeldingDocument,
    OpprettSykmeldingInput,
    OpprettSykmeldingMutation,
    SykmeldingByIdDocument,
} from '@queries'
import { spanAsync, withSpanAsync } from '@otel/otel'
import { useDraftId } from '@components/ny-sykmelding-form/draft/useDraftId'

import { useAppSelector } from '../../providers/redux/hooks'
import { useMode } from '../../providers/ModeProvider'
import { AktivitetStep, NySykmeldingMultiStepState } from '../../providers/redux/reducers/ny-sykmelding-multistep'

export function useOpprettSykmeldingMutation(): {
    opprettSykmelding: () => Promise<FetchResult<OpprettSykmeldingMutation>>
    result: MutationResult<OpprettSykmeldingMutation>
} {
    const mode = useMode()
    const draftId = useDraftId()
    const router = useRouter()
    const formState = useAppSelector((state) => state.nySykmeldingMultistep)
    const [mutate, result] = useMutation(OpprettSykmeldingDocument, {
        // In case user navigates back to the dashboard
        refetchQueries: [{ query: AllSykmeldingerDocument }, { query: GetAllDraftsDocument }],
        onCompleted: (data) => {
            if (data.opprettSykmelding.__typename === 'Sykmelding') {
                logger.info(`Sykmelding created successfully: ${data.opprettSykmelding.sykmeldingId}`)
            } else if (data.opprettSykmelding.__typename === 'OpprettSykmeldingRuleOutcome') {
                logger.info(`Sykmelding got rule hit: ${data.opprettSykmelding.rule}: ${data.opprettSykmelding.status}`)
            }
        },
        update: (cache, result) => {
            if (result.data?.opprettSykmelding == null || result.data.opprettSykmelding.__typename !== 'Sykmelding') {
                return
            }

            // Update the cache with the mutation data for instant kvittering load
            cache.writeQuery({
                query: SykmeldingByIdDocument,
                variables: { id: result.data?.opprettSykmelding.sykmeldingId },
                data: { sykmelding: result.data.opprettSykmelding },
            })
        },
    })

    const opprettSykmelding = withSpanAsync('submitSykmelding', async () => {
        teamLogger.info(`(Client) Submitting values: ${JSON.stringify(formState)}`)

        try {
            const values = formStateToOpprettSykmeldingInput(formState)

            teamLogger.info(`(Client), mapped values: ${JSON.stringify(values)}`)

            const createResult = await spanAsync('OpprettSykmelding.mutation', async () =>
                mutate({
                    variables: { draftId: draftId, values: values },
                }),
            )

            startTransition(() => {
                // Don't redirect on errors
                if (createResult.errors != null || createResult.data == null) return
                // Don't redirect on rule hits
                if (createResult.data.opprettSykmelding.__typename !== 'Sykmelding') return

                // Nuke the history, so that browser back takes the user to a fresh form
                window.history.replaceState(null, '', pathWithBasePath('/fhir'))

                const kvitteringUrl = `/${mode === 'FHIR' ? 'fhir' : 'ny'}/kvittering/${createResult.data.opprettSykmelding.sykmeldingId}`

                router.push(kvitteringUrl, {
                    scroll: true,
                })
            })

            return createResult
        } catch (e) {
            logger.error(`Sykmelding creation failed, errors ${e}`)
            throw new Error(`Sykmelding creation failed`)
        }
    })

    return { opprettSykmelding, result }
}

function formStateToOpprettSykmeldingInput(multiStepState: NySykmeldingMultiStepState): OpprettSykmeldingInput {
    if (multiStepState.pasient == null) {
        raise('Ingen pasient')
    }

    const formState = multiStepState.values
    if (formState?.aktiviteter == null) {
        raise('Ingen aktivitet')
    }

    if (formState?.diagnose == null) {
        raise('Ingen diagnose')
    }

    return {
        arbeidsforhold: formState.arbeidsforhold?.harFlereArbeidsforhold
            ? {
                  arbeidsgivernavn:
                      formState.arbeidsforhold?.sykmeldtFraArbeidsforhold ?? raise('Mangler arbeidsforhold'),
              }
            : null,
        hoveddiagnose: {
            system: formState.diagnose.hoved.system,
            code: formState.diagnose.hoved.code,
        },
        // TODO: Implement in form
        bidiagnoser: [],
        aktivitet: formState.aktiviteter.map(aktivitetStepToInputAktivitet),
        meldinger: {
            tilNav: formState.meldinger?.showTilNav && formState.meldinger.tilNav ? formState.meldinger.tilNav : null,
            tilArbeidsgiver:
                formState.meldinger?.showTilArbeidsgiver && formState.meldinger.tilArbeidsgiver
                    ? formState.meldinger.tilArbeidsgiver
                    : null,
        },
        svangerskapsrelatert: formState.andreSporsmal?.svangerskapsrelatert ?? false,
        yrkesskade: {
            yrkesskade: formState.andreSporsmal?.yrkesskade ?? false,
            skadedato: formState.andreSporsmal?.yrkesskadeDato,
        },
        tilbakedatering: formState.tilbakedatering?.fom
            ? {
                  startdato: formState.tilbakedatering.fom,
                  begrunnelse: formState.tilbakedatering.grunn,
              }
            : null,
        pasientenSkalSkjermes: multiStepState.skalSkjermes ?? false,
    }
}

function aktivitetStepToInputAktivitet(value: AktivitetStep): InputAktivitet {
    switch (value.type) {
        case 'AKTIVITET_IKKE_MULIG':
            return {
                type: 'AKTIVITET_IKKE_MULIG',
                fom: value.fom,
                tom: value.tom,
                aktivitetIkkeMulig: { dummy: true },
                avventende: null,
                gradert: null,
                behandlingsdager: null,
                reisetilskudd: null,
                medisinskArsak: {
                    isMedisinskArsak: value.medisinskArsak.isMedisinskArsak ?? false,
                },
                arbeidsrelatertArsak: {
                    isArbeidsrelatertArsak: value.arbeidsrelatertArsak.isArbeidsrelatertArsak ?? false,
                    arbeidsrelaterteArsaker: value.arbeidsrelatertArsak.arbeidsrelatertArsaker ?? [],
                    annenArbeidsrelatertArsak: value.arbeidsrelatertArsak.annenArbeidsrelatertArsak ?? null,
                },
            }
        case 'GRADERT':
            return {
                type: 'GRADERT',
                fom: value.fom,
                tom: value.tom,
                gradert: {
                    grad: +value.grad,
                    // TODO: Implement in form
                    reisetilskudd: false,
                },
                aktivitetIkkeMulig: null,
                avventende: null,
                behandlingsdager: null,
                reisetilskudd: null,
                medisinskArsak: null,
                arbeidsrelatertArsak: null,
            }
    }
}
