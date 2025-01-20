'use client'

import React, { PropsWithChildren, ReactElement } from 'react'

import { NySykmeldingFormDataProvider } from '@components/ny-sykmelding-form/data-provider/NySykmeldingFormDataProvider'
import {
    BehandlerInfo,
    NotAvailable,
    NySykmeldingFormDataService,
} from '@components/ny-sykmelding-form/data-provider/NySykmeldingFormDataService'

type Props = {
    behandler: BehandlerInfo
}

function HelseIdDataServiceProvider({ behandler, children }: PropsWithChildren<Props>): ReactElement {
    const StandaloneDataService: NySykmeldingFormDataService = {
        context: {
            pasient: NotAvailable,
            arbeidsgivere: NotAvailable,
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
    }

    return <NySykmeldingFormDataProvider dataService={StandaloneDataService}>{children}</NySykmeldingFormDataProvider>
}

export default HelseIdDataServiceProvider
