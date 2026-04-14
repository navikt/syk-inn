export type KafkaUtdypendeSporsmal = {
    svar: string
    type: string
    skjermetForArbeidsgiver: boolean
}

export type KafkaAktivitetIkkeMulig = {
    type: 'AKTIVITET_IKKE_MULIG'
    fom: string
    tom: string
    medisinskArsak: null
    arbeidsrelatertArsak: { beskrivelse: string | null; arsak: string[] } | null
}

export type KafkaGradert = {
    type: 'GRADERT'
    fom: string
    tom: string
    grad: number
    reisetilskudd: boolean
}

export type KafkaSykmeldingRecord = {
    metadata: { type: string; orgnummer: string }
    sykmelding: {
        metadata: { avsenderSystem: { navn: string; versjon: string } }
        pasient: { fnr: string }
        medisinskVurdering: {
            hovedDiagnose: { system: string; kode: string }
            biDiagnoser: { system: string; kode: string }[]
            svangerskap: boolean
            skjermetForPasient: boolean
            yrkesskade: { yrkesskadeDato: string | null } | null
            annenFravarsgrunn: string | null
        }
        aktivitet: (KafkaAktivitetIkkeMulig | KafkaGradert | { type: string })[]
        arbeidsgiver: { type: string; navn: string | null; meldingTilArbeidsgiver: string | null }
        tilbakedatering: { kontaktDato: string | null; begrunnelse: string | null } | null
        bistandNav: { bistandUmiddelbart: boolean; beskrivBistand: string | null } | null
        utdypendeSporsmal: KafkaUtdypendeSporsmal[] | null
    }
    validation: { status: string }
}
