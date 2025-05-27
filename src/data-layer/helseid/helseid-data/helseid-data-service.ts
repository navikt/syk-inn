import { raise } from '@utils/ts'
import { Behandler } from '@data-layer/resources'

import { DataService, NotAvailable } from '../../data-fetcher/data-service'

export function createHelseIdDataService(behandler: Behandler): DataService {
    return {
        mode: 'standalone',
        context: {
            pasient: NotAvailable,
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
            synchronize: async () => {
                raise('Standalone is not supported in Pilot')
            },
        },
    } satisfies DataService
}
