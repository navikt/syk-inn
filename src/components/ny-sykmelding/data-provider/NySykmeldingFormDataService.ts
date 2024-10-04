export type PatientInfo = {
    fnr: string
    navn: string
}

export type NySykmeldingFormDataService = {
    getPatient(): PatientInfo | Promise<PatientInfo>
}
