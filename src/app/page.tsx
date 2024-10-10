import { BodyShort, Detail, Heading } from '@navikt/ds-react'
import { VirusIcon } from '@navikt/aksel-icons'
import { ReactElement } from 'react'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { PageBlock } from '@navikt/ds-react/Page'

import { bundledEnv, isLocalOrDemo } from '@utils/env'

import ScenarioLinks from '../devtools/ScenarioLinks'

export default function Home(): ReactElement {
    if (!isLocalOrDemo) {
        notFound()
    }

    const renderingMode = cookies().get('development-mode-override')?.value === 'fhir' ? 'fhir' : 'standalone'

    return (
        <PageBlock as="main" width="xl" gutters>
            <div className="flex gap-3 p-3 flex-col">
                <Heading level="1" size="xlarge" className="flex gap-2 items-center">
                    <VirusIcon />
                    <div>
                        <span>Innsending av Sykmelding</span>
                        <Detail className="-mt-3">Development Page</Detail>
                    </div>
                </Heading>

                <div className="border border-border-subtle p-3 rounded mt-2">
                    <Heading size="small" className="-mt-7 bg-white w-fit px-2 py-0">
                        Metadata
                    </Heading>
                    <BodyShort size="small">
                        Rendering mode: <span className="font-bold">{renderingMode}</span>
                    </BodyShort>
                    {renderingMode === 'fhir' && <Detail>You should see custom internal header</Detail>}
                    {renderingMode === 'standalone' && (
                        <Detail>You should see a nav.no-style decorator (header and footer)</Detail>
                    )}
                    <BodyShort size="small" className="mt-2">
                        Runtime environment: <span className="font-bold">{bundledEnv.NEXT_PUBLIC_RUNTIME_ENV}</span>
                    </BodyShort>
                </div>

                <ScenarioLinks />
            </div>
        </PageBlock>
    )
}
