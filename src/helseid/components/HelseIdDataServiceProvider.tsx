'use client'

import React, { PropsWithChildren, ReactElement } from 'react'

import { NySykmeldingFormDataProvider } from '@components/ny-sykmelding-form/data-provider/NySykmeldingFormDataProvider'
import {
    BehandlerInfo,
    NotAvailable,
    NySykmeldingFormDataService,
} from '@components/ny-sykmelding-form/data-provider/NySykmeldingFormDataService'
import { raise } from '@utils/ts'

type Props = {
    behandler: BehandlerInfo
}

function HelseIdDataServiceProvider({ behandler, children }: PropsWithChildren<Props>): ReactElement {
    const StandaloneDataService: NySykmeldingFormDataService = {
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
        },
        mutation: {
            sendSykmelding: async () => {
                raise('Standalone is not supported in Pilot')
            },
        },
    }

    return <NySykmeldingFormDataProvider dataService={StandaloneDataService}>{children}</NySykmeldingFormDataProvider>
}

export default HelseIdDataServiceProvider
