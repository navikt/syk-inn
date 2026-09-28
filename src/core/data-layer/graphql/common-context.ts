export type CommonGraphqlContext = {
    patientIdent: string | null
    behandler: {
        navn: string
        hpr: string
        epost: string | null
    }
}
