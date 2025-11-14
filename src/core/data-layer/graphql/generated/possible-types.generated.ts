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
        OpprettetSykmelding: ['OtherSubmitOutcomes', 'RuleOutcome', 'SykmeldingFull'],
        Person: ['Pasient', 'QueriedPerson'],
        Sykmelding: ['SykmeldingFull', 'SykmeldingLight', 'SykmeldingRedacted'],
        SykmeldingBase: ['SykmeldingFull', 'SykmeldingLight'],
        SykmeldingValidering: ['RuleOK', 'RuleOutcome'],
    },
}
export default result
