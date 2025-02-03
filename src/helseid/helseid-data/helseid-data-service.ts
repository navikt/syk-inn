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
            pasient: NotAvailable,
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
