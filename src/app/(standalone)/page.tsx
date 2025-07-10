import { Heading } from '@navikt/ds-react'
import { VirusIcon } from '@navikt/aksel-icons'
import { ReactElement } from 'react'
import { notFound } from 'next/navigation'
import { PageBlock } from '@navikt/ds-react/Page'

import { isLocal, isDemo } from '@utils/env'

import ScenarioLinks from '../../devtools/ScenarioLinks'

import DumbDevHeader from './dumb/DumbDevHeader'

export default function Home(): ReactElement {
    if (!(isLocal || isDemo)) {
        notFound()
    }

    return (
        <PageBlock as="main" width="xl" gutters>
            <div className="flex gap-3 p-3 flex-col">
                <Heading level="1" size="xlarge" className="flex gap-2 items-center">
                    <VirusIcon className="animate-bounce" />
                    <DumbDevHeader />
                </Heading>

                <ScenarioLinks />
            </div>
        </PageBlock>
    )
}
