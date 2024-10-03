import React, { ReactElement } from 'react'
import { Heading } from '@navikt/ds-react'
import Link from 'next/link'

import Test from '@fhir/components/Test'
import { isLocalOrDemo } from '@utils/env'

function Page(): ReactElement {
    return (
        <div className="p-8">
            {isLocalOrDemo && (
                <div className="-mt-4 mb-2">
                    <Link href="/">← Back to development page</Link>
                </div>
            )}
            <Heading level="2" size="medium" spacing>
                You are FHIR-ed
            </Heading>
            <Test />
        </div>
    )
}

export default Page
