export interface PossibleTypesResultData {
    possibleTypes: {
        [key: string]: string[]
    }
}
const result: PossibleTypesResultData = {
    possibleTypes: {
        Aktivitet: ['AktivitetIkkeMulig', 'Avventende', 'Behandlingsdager', 'Gradert', 'Reisetilskudd'],
        FomTom: [
            'AktivitetIkkeMulig',
            'AktivitetRedacted',
            'Avventende',
            'Behandlingsdager',
            'Gradert',
            'Reisetilskudd',
        ],
        OpprettetSykmelding: ['RuleOutcome', 'SykmeldingFull'],
        Person: ['Pasient', 'QueriedPerson'],
        Sykmelding: ['SykmeldingFull', 'SykmeldingRedacted'],
        SykmeldingValidering: ['RuleOK', 'RuleOutcome'],
    },
}
export default result
