import { describe, expect, it } from 'vitest'

import { formValuesToStatePayload } from '@features/ny-sykmelding-form/form/form-to-state'
import { NySykmeldingMainFormValues } from '@features/ny-sykmelding-form/form/types'
import { daysAgo } from '@lib/test/date-utils'

const createFormValues = ({ fom, tom }: { fom: string; tom: string }): NySykmeldingMainFormValues => ({
    arbeidsforhold: {
        harFlereArbeidsforhold: 'NEI',
        sykmeldtFraArbeidsforhold: null,
        aaregArbeidsforhold: null,
    },
    diagnoser: {
        hoved: { system: 'ICPC2', code: 'A01', text: 'Influensa' },
        bidiagnoser: [],
    },
    perioder: [
        {
            // Default periode is GRADERT from Today
            periode: { fom: fom, tom: tom },
            aktivitet: { type: 'GRADERT', grad: '70' },
            medisinskArsak: null,
            arbeidsrelatertArsak: null,
        },
    ],
    tilbakedatering: {
        fom: fom,
        grunn: 'VENTETID_LEGETIME',
        annenGrunn: null,
    },
    meldinger: {
        showTilNav: false,
        tilNav: null,
        showTilArbeidsgiver: false,
        tilArbeidsgiver: null,
    },
    andreSporsmal: {
        svangerskapsrelatert: false,
        yrkesskade: { yrkesskade: false, skadedato: null },
    },
    utdypendeSporsmal: {
        utfordringerMedArbeid: null,
        medisinskOppsummering: null,
        hensynPaArbeidsplassen: null,
        sykdomsutvikling: null,
        arbeidsrelaterteUtfordringer: null,
        behandlingOgFremtidigArbeid: null,
        uavklarteForhold: null,
        oppdatertMedisinskStatus: null,
        realistiskMestringArbeid: null,
        forventetHelsetilstandUtvikling: null,
        medisinskeHensyn: null,
    },
    annenFravarsgrunn: {
        harFravarsgrunn: false,
        fravarsgrunn: null,
    },
})

describe('formValuesToStatePayload', () => {
    it('tilbakedatering grunn skal settes til null dersom det ikke er en tilbakedatering', () => {
        const values = createFormValues({
            fom: daysAgo(3),
            tom: daysAgo(1),
        })
        expect(formValuesToStatePayload(values).tilbakedatering).toBeNull()
    })
    it('tilbakedatering grunn skal ikke settes til null dersom det er en tilbakedatering', () => {
        const values = createFormValues({
            fom: daysAgo(5),
            tom: daysAgo(1),
        })
        expect(formValuesToStatePayload(values).tilbakedatering).toEqual({
            fom: values.tilbakedatering?.fom,
            grunn: values.tilbakedatering?.grunn,
            annenGrunn: null,
        })
    })
})
