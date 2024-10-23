import React, { ReactElement } from 'react'
import { Heading } from '@navikt/ds-react'
import Link from 'next/link'
import { PageBlock } from '@navikt/ds-react/Page'

import { isLocalOrDemo } from '@utils/env'
import { saveSessionCompleted } from '@fhir/sessions/session-lifecycle'
import FhirClientProvider from '@fhir/components/FhirClientProvider'
import FhirHeaderUser from '@fhir/components/FhirHeaderUser'
import NySykmeldingForm from '@components/ny-sykmelding-form/NySykmeldingForm'

type Props = {
    searchParams: Promise<{ code: string | undefined }>
}

async function Page(props: Props): Promise<ReactElement> {
    const searchParams = await props.searchParams
    if (searchParams.code) {
        /**
         * Server component:
         *
         * Similar to /launch/page.tsx, the ?code=<code> parameter is only available at server component rendering time
         * when the user is returned here after authenticating with the FHIR server. The fhircliest-library will remove
         * the code from the URL client side.
         */
        await saveSessionCompleted(searchParams.code)
    }

    return (
        <PageBlock as="main" width="xl" gutters className="pt-4">
            {isLocalOrDemo && (
                <div className="mb-2">
                    <Link href="/">← Back to development page</Link>
                </div>
            )}
            <Heading level="2" size="medium" spacing>
                Opprett ny sykmelding
            </Heading>
            <FhirClientProvider>
                <FhirHeaderUser />
                <NySykmeldingForm />
            </FhirClientProvider>
        </PageBlock>
    )
}

export default Page
