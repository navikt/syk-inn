import { Resolvers } from '@resolvers'

export const typeResolvers: Resolvers = {
    OpprettetSykmelding: {
        __resolveType: (parent) => ('sykmeldingId' in parent ? 'SykmeldingFull' : 'OpprettSykmeldingRuleOutcome'),
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
