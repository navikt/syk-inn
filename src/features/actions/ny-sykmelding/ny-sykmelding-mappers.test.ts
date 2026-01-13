import { expect, test } from 'vitest'
import { DefaultValues } from 'react-hook-form'

import { dateOnly } from '@lib/date'
import { NySykmeldingMainFormValues } from '@features/ny-sykmelding-form/form/types'
import { nySykmeldingDefaultValues } from '@features/actions/ny-sykmelding/ny-sykmelding-mappers'

test('multiple bidiagnoser from server suggestion shall be used', () => {
    const defaultValues = nySykmeldingDefaultValues(null, {
        diagnose: {
            value: { __typename: 'Diagnose', system: 'ICPC2', code: 'A01', text: 'Influensa' },
        },
        bidiagnoser: [
            { system: 'ICPC2', code: 'A01', text: 'Influensa', __typename: 'Diagnose' },
            { system: 'ICPC2', code: 'B02', text: 'Forkjølelse', __typename: 'Diagnose' },
        ],
    })

    expect(defaultValues).toEqual({
        arbeidsforhold: { harFlereArbeidsforhold: 'NEI', sykmeldtFraArbeidsforhold: null, aaregArbeidsforhold: null },
        // Server suggested diagnose
        diagnoser: {
            hoved: { system: 'ICPC2', code: 'A01', text: 'Influensa' },
            bidiagnoser: [
                { system: 'ICPC2', code: 'A01', text: 'Influensa' },
                { system: 'ICPC2', code: 'B02', text: 'Forkjølelse' },
            ],
        },
        perioder: [
            {
                // Default periode is GRADERT from Today
                periode: { fom: dateOnly(new Date()), tom: '' },
                aktivitet: { type: 'GRADERT', grad: null },
                medisinskArsak: null,
                arbeidsrelatertArsak: null,
            },
        ],
        tilbakedatering: null,
        meldinger: { showTilNav: false, tilNav: null, showTilArbeidsgiver: false, tilArbeidsgiver: null },
        andreSporsmal: { svangerskapsrelatert: false, yrkesskade: { yrkesskade: false, skadedato: null } },
        utdypendeSporsmal: {
            utfordringerMedArbeid: null,
            medisinskOppsummering: null,
            hensynPaArbeidsplassen: null,
        },
        annenFravarsgrunn: {
            harFravarsgrunn: false,
            fravarsgrunn: null,
        },
    } satisfies DefaultValues<NySykmeldingMainFormValues>)
})
