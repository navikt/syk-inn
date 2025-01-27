import { raise } from '@utils/ts'

import { BehandlerInfo, DataService, NotAvailable } from '../../data-fetcher/data-service'

export function createHelseIdDataService(behandler: BehandlerInfo): DataService {
    return {
        mode: 'standalone',
        context: {
            pasient: NotAvailable,
            arbeidsgivere: NotAvailable,
            konsultasjon: NotAvailable,
            behandler: behandler,
        },
        query: {
            pasient: async (fnr) => ({
                // TODO: Hvor søke, PDL?
                oid: { type: 'fnr', nr: fnr },
                navn: 'Stand Alonessen',
                // TODO: mulig å finne standalone?
                fastlege: null,
            }),
            sykmelding: async () => {
                raise('Standalone is not supported in Pilot')
            },
        },
        mutation: {
            sendSykmelding: async () => {
                raise('Standalone is not supported in Pilot')
            },
        },
    } satisfies DataService
}
