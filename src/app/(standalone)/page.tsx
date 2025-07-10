import { BodyShort, Detail, Heading } from '@navikt/ds-react'
import { VirusIcon } from '@navikt/aksel-icons'
import { ReactElement } from 'react'
import { notFound } from 'next/navigation'
import { PageBlock } from '@navikt/ds-react/Page'

import { bundledEnv, isLocal, isDemo } from '@utils/env'

import ScenarioLinks from '../../devtools/ScenarioLinks'

export default function Home(): ReactElement {
    if (!(isLocal || isDemo)) {
        notFound()
    }

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

                <ScenarioLinks />
                <div className="border border-border-subtle p-3 rounded-sm mt-2">
                    <Heading size="small" className="-mt-7 bg-white w-fit px-2 py-0">
                        Metadata
                    </Heading>
                    <BodyShort size="small" className="mt-2">
                        Runtime environment: <span className="font-bold">{bundledEnv.runtimeEnv}</span>
                    </BodyShort>
                    <BodyShort size="small" className="mt-2">
                        Basepath: <span className="font-bold">{bundledEnv.NEXT_PUBLIC_BASE_PATH || '/'}</span>
                    </BodyShort>
                </div>
            </div>
        </PageBlock>
    )
}
