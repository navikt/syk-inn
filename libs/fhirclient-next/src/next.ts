import { fhirclient } from 'fhirclient/lib/types'

import NextAdapter from './adapters/NextAdapter'

function smart(headers: Headers, storage: fhirclient.Storage | fhirclient.storageFactory): fhirclient.SMART {
    return new NextAdapter({
        headers,
        storage,
    }).getSmartApi()
}

export type ServerStorage = fhirclient.Storage

export default smart
