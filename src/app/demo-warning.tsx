import React, { ReactElement } from 'react'
import { Alert } from '@navikt/ds-react'
import { PageBlock } from '@navikt/ds-react/Page'

function DemoWarning(): ReactElement {
    return (
        <PageBlock as="main" width="xl" gutters className="pt-4">
            <div className="max-w-prose">
                <Alert variant="warning">Dette er en demoside og inneholder ikke dine personlige data.</Alert>
            </div>
        </PageBlock>
    )
}

export default DemoWarning
