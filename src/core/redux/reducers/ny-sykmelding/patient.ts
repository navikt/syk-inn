export type ManualPatient = {
    type: 'manual'
    ident: string
    navn: string
}

export type AutoPatient = {
    type: 'auto'
    ident: string
    navn: string
}

export type ActivePatient = ManualPatient | AutoPatient
