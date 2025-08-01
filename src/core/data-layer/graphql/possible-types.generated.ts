export interface PossibleTypesResultData {
    possibleTypes: {
        [key: string]: string[]
    }
}
const result: PossibleTypesResultData = {
    possibleTypes: {
        Aktivitet: ['AktivitetIkkeMulig', 'Avventende', 'Behandlingsdager', 'Gradert', 'Reisetilskudd'],
        FomTom: ['AktivitetIkkeMulig', 'AktivitetLight', 'Avventende', 'Behandlingsdager', 'Gradert', 'Reisetilskudd'],
        OpprettetSykmelding: ['OpprettSykmeldingRuleOutcome', 'SykmeldingFull'],
        Person: ['Pasient', 'QueriedPerson'],
        Sykmelding: ['SykmeldingFull', 'SykmeldingLight'],
    },
}
export default result
