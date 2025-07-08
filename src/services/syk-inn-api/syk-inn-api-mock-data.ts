import { SykInnApiSykmelding } from '@services/syk-inn-api/schema/sykmelding'

export function createMockSykmelding(
    overrides: Partial<SykInnApiSykmelding> = {},
    values: Partial<SykInnApiSykmelding['values']> = {},
): SykInnApiSykmelding {
    return {
        sykmeldingId: 'ba78036d-b63c-4c5a-b3d5-b1d1f812da8d',
        meta: {
            pasientIdent: '12345678910',
            sykmelder: {
                hprNummer: '123456789',
                fornavn: 'Ola',
                mellomnavn: 'Norman',
                etternavn: 'Hansen',
            },
            legekontorOrgnr: '999944614',
            legekontorTlf: '12345678',
            mottatt: '2024-02-15T12:00:00Z',
        },
        values: {
            aktivitet: [
                {
                    type: 'AKTIVITET_IKKE_MULIG',
                    fom: '2024-02-15',
                    tom: '2024-02-18',
                    medisinskArsak: {
                        isMedisinskArsak: true,
                    },
                    arbeidsrelatertArsak: {
                        isArbeidsrelatertArsak: false,
                        arbeidsrelatertArsaker: [],
                        annenArbeidsrelatertArsak: null,
                    },
                },
            ],
            hoveddiagnose: {
                system: 'ICD10',
                code: 'L73',
                text: 'Brudd legg/ankel',
            },
            bidiagnoser: [],
            svangerskapsrelatert: false,
            pasientenSkalSkjermes: false,
            meldinger: {
                tilNav: null,
                tilArbeidsgiver: null,
            },
            yrkesskade: null,
            arbeidsgiver: null,
            tilbakedatering: null,
            ...values,
        },
        utfall: {
            result: 'OK',
            melding: null,
        },
        ...overrides,
    }
}
