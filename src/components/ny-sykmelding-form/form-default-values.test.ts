import { expect, test } from 'vitest'

import { createDefaultFormValues } from '@components/ny-sykmelding-form/form-default-values'
import { NySykmeldingSuggestions } from '@components/ny-sykmelding-form/form'
import { dateOnly } from '@utils/date'

import { DraftValues } from '../../data-layer/draft/draft-schema'
import { MainSectionValues } from '../../providers/redux/reducers/ny-sykmelding-multistep'

test('draft values shall be used as default if provided', () => {
    const defaultValues = createDefaultFormValues({
        valuesInState: null,
        draftValues: fullDraft,
        serverSuggestions: fullServerSuggestions,
    })

    expect(defaultValues).toEqual({
        arbeidsforhold: { harFlereArbeidsforhold: 'JA', sykmeldtFraArbeidsforhold: 'Draft Arbeidsforhold' },
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
                    annenArbeidsrelatertArsak: 'Ingen tilretteleggingsmuligheter',
                    arbeidsrelaterteArsaker: ['TILRETTELEGGING_IKKE_MULIG'],
                    isArbeidsrelatertArsak: true,
                },
            },
        ],
        // Diagnose from draft, not server suggestion
        diagnoser: {
            hoved: { system: 'ICD10', code: 'A00', text: 'Kolera' },
            bidiagnoser: [{ system: 'ICPC2', code: 'L73', text: 'Brudd legg/ankel' }],
        },
        tilbakedatering: { fom: '2024-12-15', grunn: 'VENTETID_LEGETIME', annenGrunn: null },
        meldinger: {
            showTilNav: true,
            showTilArbeidsgiver: true,
            tilNav: 'Draft Melding til Nav',
            tilArbeidsgiver: 'Draft Melding til Arbeidsgiver',
        },
        andreSporsmal: { svangerskapsrelatert: false, yrkesskade: { yrkesskade: true, skadedato: '2024-11-20' } },
    })
})

test('form values shall have higher presedence than draft values', () => {
    const defaultValues = createDefaultFormValues({
        valuesInState: fullExistingStateValues,
        draftValues: fullDraft,
        serverSuggestions: fullServerSuggestions,
    })

    expect(defaultValues).toEqual({
        arbeidsforhold: { harFlereArbeidsforhold: 'JA', sykmeldtFraArbeidsforhold: 'Form values Arbeidsgiver' },
        perioder: [
            {
                periode: { fom: '2025-02-01', tom: '2025-02-14' },
                aktivitet: { type: 'GRADERT', grad: '40' },
                medisinskArsak: null,
                arbeidsrelatertArsak: null,
            },
            {
                periode: { fom: '2025-02-15', tom: '2025-02-28' },
                aktivitet: { type: 'AKTIVITET_IKKE_MULIG', grad: null },
                medisinskArsak: { isMedisinskArsak: true },
                arbeidsrelatertArsak: {
                    isArbeidsrelatertArsak: true,
                    arbeidsrelaterteArsaker: ['TILRETTELEGGING_IKKE_MULIG', 'ANNET'],
                    annenArbeidsrelatertArsak: 'Ingen mulighet for hjemmekontor',
                },
            },
            {
                periode: { fom: '2025-03-01', tom: '2025-03-10' },
                aktivitet: { type: 'GRADERT', grad: '20' },
                medisinskArsak: null,
                arbeidsrelatertArsak: null,
            },
        ],
        diagnoser: {
            hoved: { system: 'ICPC2', code: 'L02', text: 'Ryggsmerter' },
            bidiagnoser: [{ system: 'ICD10', code: 'M54.5', text: 'Lumbago' }],
        },
        tilbakedatering: { fom: '2025-01-20', grunn: 'VENTETID_LEGETIME', annenGrunn: null },
        meldinger: {
            showTilNav: true,
            showTilArbeidsgiver: true,
            tilNav: 'Vurdering gjort på bakgrunn av pasientens egenbeskrivelse.',
            tilArbeidsgiver: 'Pasienten anbefales å jobbe redusert i en periode.',
        },
        andreSporsmal: { svangerskapsrelatert: true, yrkesskade: { yrkesskade: false, skadedato: null } },
    })
})

test('server suggestions shall be used if no draft or form values are provided', () => {
    const defaultValues = createDefaultFormValues({
        valuesInState: null,
        draftValues: null,
        serverSuggestions: fullServerSuggestions,
    })

    expect(defaultValues).toEqual({
        arbeidsforhold: { harFlereArbeidsforhold: 'NEI', sykmeldtFraArbeidsforhold: null },
        // Server suggested diagnose
        diagnoser: { hoved: { system: 'ICPC2', code: 'A01', text: 'Influensa' }, bidiagnoser: [] },
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
    })
})

const fullServerSuggestions: NySykmeldingSuggestions = {
    diagnose: {
        value: {
            __typename: 'Diagnose',
            system: 'ICPC2',
            code: 'A01',
            text: 'Influensa',
        },
    },
}

const fullDraft: DraftValues = {
    arbeidsforhold: {
        harFlereArbeidsforhold: 'JA',
        sykmeldtFraArbeidsforhold: 'Draft Arbeidsforhold',
    },
    perioder: [
        {
            type: 'GRADERT',
            fom: '2025-01-01',
            tom: '2025-01-15',
            grad: '50',
            medisinskArsak: null,
            arbeidsrelatertArsak: null,
        },
        {
            type: 'AKTIVITET_IKKE_MULIG',
            fom: '2025-01-16',
            tom: '2025-01-31',
            medisinskArsak: {
                isMedisinskArsak: false,
            },
            arbeidsrelatertArsak: {
                isArbeidsrelatertArsak: true,
                arbeidsrelaterteArsaker: ['TILRETTELEGGING_IKKE_MULIG'],
                annenArbeidsrelatertArsak: 'Ingen tilretteleggingsmuligheter',
            },
        },
    ],
    hoveddiagnose: { system: 'ICD10', code: 'A00', text: 'Kolera' },
    bidiagnoser: [{ system: 'ICPC2', code: 'L73', text: 'Brudd legg/ankel' }],
    tilbakedatering: {
        fom: '2024-12-15',
        grunn: 'VENTETID_LEGETIME',
        annenGrunn: null,
    },
    meldinger: {
        showTilNav: true,
        tilNav: 'Draft Melding til Nav',
        showTilArbeidsgiver: true,
        tilArbeidsgiver: 'Draft Melding til Arbeidsgiver',
    },
    svangerskapsrelatert: false,
    yrkesskade: { yrkesskade: true, skadedato: '2024-11-20' },
}

const fullExistingStateValues: MainSectionValues = {
    arbeidsforhold: { harFlereArbeidsforhold: true, sykmeldtFraArbeidsforhold: 'Form values Arbeidsgiver' },
    aktiviteter: [
        { type: 'GRADERT', fom: '2025-02-01', tom: '2025-02-14', grad: 40 },
        {
            type: 'AKTIVITET_IKKE_MULIG',
            fom: '2025-02-15',
            tom: '2025-02-28',
            medisinskArsak: { isMedisinskArsak: true },
            arbeidsrelatertArsak: {
                isArbeidsrelatertArsak: true,
                arbeidsrelaterteArsaker: ['TILRETTELEGGING_IKKE_MULIG', 'ANNET'],
                annenArbeidsrelatertArsak: 'Ingen mulighet for hjemmekontor',
            },
        },
        { type: 'GRADERT', fom: '2025-03-01', tom: '2025-03-10', grad: 20 },
    ],
    tilbakedatering: { fom: '2025-01-20', grunn: 'VENTETID_LEGETIME', annenGrunn: null },
    diagnose: {
        hoved: { system: 'ICPC2', code: 'L02', text: 'Ryggsmerter' },
        bi: [
            { system: 'ICD10', code: 'M54.5', text: 'Lumbago' },
            { system: 'ICD10', code: 'R51', text: 'Hodepine' },
        ],
    },
    meldinger: {
        showTilNav: true,
        showTilArbeidsgiver: true,
        tilNav: 'Vurdering gjort på bakgrunn av pasientens egenbeskrivelse.',
        tilArbeidsgiver: 'Pasienten anbefales å jobbe redusert i en periode.',
    },
    andreSporsmal: {
        svangerskapsrelatert: true,
        yrkesskade: false,
        yrkesskadeDato: null,
    },
}
