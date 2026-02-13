import { BodyShort, Detail, Heading, InfoCard } from '@navikt/ds-react'
import { LinkCard, LinkCardAnchor, LinkCardIcon, LinkCardTitle } from '@navikt/ds-react/LinkCard'
import { InformationSquareIcon, TerminalIcon, VirusIcon } from '@navikt/aksel-icons'
import React, { ReactElement } from 'react'
import { notFound } from 'next/navigation'
import { Page, PageBlock } from '@navikt/ds-react/Page'
import { InfoCardContent, InfoCardHeader, InfoCardTitle } from '@navikt/ds-react/InfoCard'

import { isLocal, isDemo, getServerEnv } from '@lib/env'
import { getAbsoluteURL, pathWithBasePath } from '@lib/url'
import ScenarioLinksFhir from '@dev/tools/ScenarioLinksFhir'
import ScenarioLinksStandalone from '@dev/tools/ScenarioLinksStandalone'
import { MockLaunchType } from '@navikt/fhir-mock-server/types'

import DumbDevHeader from './dumb/DumbDevHeader'

export default function Home(): ReactElement {
    if (!(isLocal || isDemo)) {
        notFound()
    }

    const isSykInnApiIntegrationEnabled = getServerEnv().useLocalSykInnApi
    const isLocalValkeyEnabled = getServerEnv().useLocalValkey
    return (
        <Page className="bg-transparent">
            <PageBlock as="main" width="xl" gutters>
                <div className="flex gap-6 p-4 ax-sm:p-6 ax-md:p-8 flex-col bg-ax-bg-default rounded-xl">
                    <Heading level="1" size="xlarge" className="flex gap-2 items-center">
                        <VirusIcon className="animate-bounce hidden ax-md:block" />
                        <DumbDevHeader className="text-2xl ax-sm:text-4xl ax-md:text-5xl" />
                    </Heading>

                    <Detail className="-mt-4">
                        Denne siden er ikke synlig i dev-gcp eller prod-gcp, kun lokal utvikling og demo
                    </Detail>

                    <div className="border border-ax-border-neutral-subtle p-3 rounded-sm mt-2 bg-ax-bg-default">
                        <Heading level="2" size="small" className="-mt-7 bg-ax-bg-default w-fit px-2 py-0">
                            Scenarioer
                        </Heading>

                        {isSykInnApiIntegrationEnabled && (
                            <div className="border border-ax-border-neutral-subtle p-3 rounded-sm mt-2">
                                <Heading size="small" className="-mt-7 bg-ax-bg-default w-fit px-2 py-0">
                                    You have enabled syk-inn-api localhost integration!
                                </Heading>
                                <BodyShort size="small" className="mt-2 mb-4">
                                    Disable{' '}
                                    <code className="text-sm bg-ax-bg-neutral-soft p-1 rounded-md">
                                        USE_LOCAL_SYK_INN_API=true
                                    </code>{' '}
                                    in your .env.development file to enable normal scenarios.
                                </BodyShort>
                                <LinkCard>
                                    <LinkCardIcon>
                                        <TerminalIcon fontSize="2rem" />
                                    </LinkCardIcon>
                                    <LinkCardTitle>
                                        <LinkCardAnchor
                                            href={pathWithBasePath(
                                                `/fhir/launch?iss=${`${getAbsoluteURL()}/api/mocks/fhir&launch=${`local-dev-launch:Espen Eksempel` satisfies MockLaunchType}`}`,
                                            )}
                                        >
                                            Launch with syk-inn-api!
                                        </LinkCardAnchor>
                                    </LinkCardTitle>
                                </LinkCard>
                            </div>
                        )}

                        {isLocalValkeyEnabled && (
                            <InfoCard data-color="info" className="mt-4 mb-6" size="small">
                                <InfoCardHeader icon={<InformationSquareIcon aria-hidden />}>
                                    <InfoCardTitle>You have enabled local Valkey!</InfoCardTitle>
                                </InfoCardHeader>
                                <InfoCardContent>
                                    <BodyShort spacing>
                                        Any scenarios that include drafts will not be a part of the scenario you launch.
                                    </BodyShort>
                                    Set{' '}
                                    <code className="text-sm bg-ax-bg-neutral-soft p-1 rounded-md">
                                        USE_LOCAL_VALKEY=false
                                    </code>{' '}
                                    in your .env.development file to re-enable drafts in scenarios.
                                </InfoCardContent>
                            </InfoCard>
                        )}

                        {!isSykInnApiIntegrationEnabled && <ScenarioLinksFhir />}

                        <ScenarioLinksStandalone />
                    </div>
                </div>
            </PageBlock>
        </Page>
    )
}
