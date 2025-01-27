'use client'

import React, { PropsWithChildren, ReactElement } from 'react'

import { raise } from '@utils/ts'

import { DataProvider } from '../../data-fetcher/data-provider'
import { BehandlerInfo, NotAvailable, DataService } from '../../data-fetcher/data-service'

type Props = {
    behandler: BehandlerInfo
}

function HelseIdDataProvider({ behandler, children }: PropsWithChildren<Props>): ReactElement {
    const StandaloneDataService: DataService = {
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
    }

    return <DataProvider dataService={StandaloneDataService}>{children}</DataProvider>
}

export default HelseIdDataProvider
