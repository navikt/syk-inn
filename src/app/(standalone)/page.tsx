import { BodyShort, Heading } from '@navikt/ds-react'
import { LinkCard, LinkCardAnchor, LinkCardIcon, LinkCardTitle } from '@navikt/ds-react/LinkCard'
import { TerminalIcon, VirusIcon } from '@navikt/aksel-icons'
import React, { ReactElement } from 'react'
import { notFound } from 'next/navigation'
import { PageBlock } from '@navikt/ds-react/Page'

import { isLocal, isDemo, getServerEnv } from '@utils/env'
import { getAbsoluteURL, pathWithBasePath } from '@utils/url'

import ScenarioLinks from '../../devtools/ScenarioLinks'

import DumbDevHeader from './dumb/DumbDevHeader'

export default function Home(): ReactElement {
    if (!(isLocal || isDemo)) {
        notFound()
    }

    const isSykInnApiIntegrationEnabled = getServerEnv().useLocalSykInnApi
    return (
        <PageBlock as="main" width="xl" gutters>
            <div className="flex gap-6 p-3 flex-col">
                <Heading level="1" size="xlarge" className="flex gap-2 items-center">
                    <VirusIcon className="animate-bounce" />
                    <DumbDevHeader />
                </Heading>

                {isSykInnApiIntegrationEnabled && (
                    <div className="border border-border-subtle p-3 rounded-sm mt-2">
                        <Heading size="small" className="-mt-7 bg-white w-fit px-2 py-0">
                            You have enabled syk-inn-api localhost integration!
                        </Heading>
                        <BodyShort size="small" className="mt-2 mb-4">
                            Disable{' '}
                            <code className="text-sm bg-bg-subtle p-1 rounded-md">USE_LOCAL_SYK_INN_API=true</code> in
                            your .env.development file to enable normal scenarios.
                        </BodyShort>
                        <LinkCard>
                            <LinkCardIcon>
                                <TerminalIcon fontSize="2rem" />
                            </LinkCardIcon>
                            <LinkCardTitle>
                                <LinkCardAnchor
                                    href={pathWithBasePath(
                                        `/fhir/launch?iss=${`${getAbsoluteURL()}/api/mocks/fhir&launch=local-dev-id`}`,
                                    )}
                                >
                                    Launch with syk-inn-api!
                                </LinkCardAnchor>
                            </LinkCardTitle>
                        </LinkCard>
                    </div>
                )}

                {!isSykInnApiIntegrationEnabled && <ScenarioLinks />}
            </div>
        </PageBlock>
    )
}
