import { ExistingSykmelding } from '@services/syk-inn-api/syk-inn-api-schema'

export function createMockSykmelding(): ExistingSykmelding {
    return {
        sykmeldingId: 'ba78036d-b63c-4c5a-b3d5-b1d1f812da8d',
        pasientFnr: '12345678910',
        sykmelderHpr: '123456789',
        legekontorOrgnr: '999944614',
        sykmelding: {
            aktivitet: {
                type: 'AKTIVITET_IKKE_MULIG',
                fom: '2024-02-15',
                tom: '2024-02-18',
            },
            hoveddiagnose: {
                system: '2.16.578.1.12.4.1.1.7170',
                code: 'L73',
                // text: 'Brudd legg/ankel',
            },
        },
    }
}
