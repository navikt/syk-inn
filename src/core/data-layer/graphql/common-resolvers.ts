import { QueryResolvers, Resolvers } from '@resolvers'
import { searchDiagnose } from '@data-layer/common/diagnose-search'
import { raise } from '@lib/ts'

export const commonQueryResolvers: QueryResolvers = {
    diagnose: (_, { query }) => searchDiagnose(query),
}

export const typeResolvers: Resolvers = {
    SykmeldingValidering: {
        __resolveType: (parent) => ('ok' in parent ? 'RuleOK' : 'RuleOutcome'),
    },
    OpprettetSykmelding: {
        __resolveType: (parent) => {
            if ('cause' in parent) {
                return 'OtherSubmitOutcomes'
            } else if ('sykmeldingId' in parent) {
                return 'SykmeldingFull'
            } else if ('rule' in parent) {
                return 'RuleOutcome'
            }

            return raise('Ukjent type OpprettetSykmelding')
        },
    },
    Aktivitet: {
        __resolveType: (parent) => {
            switch (parent.type) {
                case 'AKTIVITET_IKKE_MULIG':
                    return 'AktivitetIkkeMulig'
                case 'AVVENTENDE':
                    return 'Avventende'
                case 'BEHANDLINGSDAGER':
                    return 'Behandlingsdager'
                case 'GRADERT':
                    return 'Gradert'
                case 'REISETILSKUDD':
                    return 'Reisetilskudd'
            }
        },
    },
    Sykmelding: {
        __resolveType: (parent) => {
            switch (parent.kind as 'redacted' | 'full') {
                case 'redacted':
                    return 'SykmeldingRedacted'
                case 'full':
                    return 'SykmeldingFull'
            }
        },
    },
}
