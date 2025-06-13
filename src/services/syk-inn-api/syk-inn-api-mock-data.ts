import { SykInnApiSykmelding } from '@services/syk-inn-api/schema/sykmelding'

export function createMockSykmelding(): SykInnApiSykmelding {
    return {
        sykmeldingId: 'ba78036d-b63c-4c5a-b3d5-b1d1f812da8d',
        meta: {
            pasientIdent: '12345678910',
            sykmelderHpr: '123456789',
            legekontorOrgnr: '999944614',
            mottatt: '2024-02-15T12:00:00Z',
        },
        values: {
            aktivitet: [
                {
                    type: 'AKTIVITET_IKKE_MULIG',
                    fom: '2024-02-15',
                    tom: '2024-02-18',
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
        },
        utfall: {
            result: 'OK',
            melding: null,
        },
    }
}
