export type Pasient = {
    navn: string
    ident: string
}

export type Behandler = {
    navn: string
    hpr: string
    epost: string | null
}

export type BehandlerMeta = {
    orgnummer: string
    legekontorTlf: string
}
