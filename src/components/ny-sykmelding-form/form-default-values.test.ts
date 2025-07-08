import { expect, test } from 'vitest'

import { createDefaultFormValues } from '@components/ny-sykmelding-form/form-default-values'

import { DraftValues } from '../../data-layer/draft/draft-schema'

test('draft values shall be used as default if provided', () => {
    const draftValues: DraftValues = {
        arbeidsforhold: {
            harFlereArbeidsforhold: 'JA',
            sykmeldtFraArbeidsforhold: '123',
        },
        perioder: [
            {
                type: 'GRADERT',
                fom: '2025-01-01',
                tom: '2025-01-15',
                grad: '50',
                medisinskArsak: {
                    isMedisinskArsak: true,
                },
                arbeidsrelatertArsak: {
                    isArbeidsrelatertArsak: true,
                    arbeidsrelatertArsaker: ['TILRETTELEGGING_IKKE_MULIG'],
                    annenArbeidsrelatertArsak: 'Ingen tilretteleggingsmuligheter',
                },
            },
            {
                type: 'AKTIVITET_IKKE_MULIG',
                fom: '2025-01-16',
                tom: '2025-01-31',
                medisinskArsak: {
                    isMedisinskArsak: false,
                },
                arbeidsrelatertArsak: null,
            },
        ],
        hoveddiagnose: {
            system: 'ICD10',
            code: 'A00',
            text: 'Kolera',
        },
        tilbakedatering: {
            fom: '2024-12-15',
            grunn: 'Pasienten kunne ikke oppsøke lege tidligere',
        },
        meldinger: {
            showTilNav: true,
            tilNav: 'Melding til NAV',
            showTilArbeidsgiver: false,
            tilArbeidsgiver: null,
        },
        svangerskapsrelatert: false,
        yrkesskade: {
            yrkesskade: true,
            skadedato: '2024-11-20',
        },
    }

    const defaultValues = createDefaultFormValues({
        valuesInState: null,
        draftValues: draftValues,
        serverSuggestions: {
            diagnose: {
                value: {
                    system: 'ICPC2',
                    code: 'A01',
                    text: 'Influensa',
                },
            },
        },
    })

    expect(defaultValues).toEqual({
        arbeidsforhold: { harFlereArbeidsforhold: 'JA', sykmeldtFraArbeidsforhold: '123' },
        perioder: [
            {
                periode: { fom: '2025-01-01', tom: '2025-01-15' },
                aktivitet: { type: 'GRADERT', grad: '50' },
                medisinskArsak: null,
                arbeidsrelatertArsak: null,
            },
            {
                periode: { fom: '2025-01-16', tom: '2025-01-31' },
                aktivitet: { type: 'AKTIVITET_IKKE_MULIG', grad: null },
                medisinskArsak: { isMedisinskArsak: false },
                arbeidsrelatertArsak: {
                    // TODO: This mapping seems broken :shock:
                    isArbeidsrelatertArsak: false,
                    arbeidsrelatertArsaker: null,
                    annenArbeidsrelatertArsak: null,
                },
            },
        ],
        // Diagnose from draft, not server suggestion
        diagnoser: { hoved: { system: 'ICD10', code: 'A00', text: 'Kolera' } },
        tilbakedatering: { fom: '2024-12-15', grunn: 'Pasienten kunne ikke oppsøke lege tidligere' },
        meldinger: { showTilNav: true, showTilArbeidsgiver: false, tilNav: 'Melding til NAV', tilArbeidsgiver: null },
        andreSporsmal: { svangerskapsrelatert: false, yrkesskade: { yrkesskade: true, skadedato: '2024-11-20' } },
    })
})
