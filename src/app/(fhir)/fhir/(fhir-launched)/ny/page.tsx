import React, { ReactElement, Suspense } from 'react'
import { Page, PageBlock } from '@navikt/ds-react/Page'

import NySykmeldingForm from '@components/ny-sykmelding-form/NySykmeldingForm'
import { PasientDocument } from '@queries'
// import { getFhirClient, PreloadFhirQuery } from '@graphql/apollo/apollo-client-server'
import { PreloadFhirQuery } from '@graphql/apollo/apollo-client-server'

async function NySykmeldingPage(): Promise<ReactElement> {
    // console.log('IN DA PAGE')

    // const res = await getFhirClient().query({
    //     query: PasientDocument,
    // })

    // console.log('RES', res)

    return (
        <Page>
            <PageBlock as="main" gutters className="pt-4">
                <NySykmeldingForm />
            </PageBlock>
            <PreloadFhirQuery query={PasientDocument}>
                <Suspense fallback={<>loading</>}></Suspense>
            </PreloadFhirQuery>
        </Page>
    )
}

export default NySykmeldingPage
