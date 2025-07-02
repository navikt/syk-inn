export interface PossibleTypesResultData {
    possibleTypes: {
        [key: string]: string[]
    }
}
const result: PossibleTypesResultData = {
    possibleTypes: {
        Aktivitet: ['AktivitetIkkeMulig', 'Avventende', 'Behandlingsdager', 'Gradert', 'Reisetilskudd'],
        FomTom: ['AktivitetIkkeMulig', 'Avventende', 'Behandlingsdager', 'Gradert', 'Reisetilskudd'],
        OpprettetSykmelding: ['OpprettSykmeldingRuleOutcome', 'Sykmelding'],
        Person: ['Pasient', 'QueriedPerson'],
    },
}
export default result
