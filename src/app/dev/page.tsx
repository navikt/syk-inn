import { BodyShort, Detail, Heading, InfoCard } from '@navikt/ds-react'
import { LinkCard, LinkCardAnchor, LinkCardIcon, LinkCardTitle } from '@navikt/ds-react/LinkCard'
import { InformationSquareIcon, TerminalIcon, VirusIcon } from '@navikt/aksel-icons'
import React, { ReactElement } from 'react'
import { notFound } from 'next/navigation'
import { Page, PageBlock } from '@navikt/ds-react/Page'

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
                <div className="flex gap-6 p-4 sm:p-6 md:p-8 flex-col bg-white rounded-xl">
                    <Heading level="1" size="xlarge" className="flex gap-2 items-center">
                        <VirusIcon className="animate-bounce hidden md:block" />
                        <DumbDevHeader className="text-2xl sm:text-4xl md:text-5xl" />
                    </Heading>

                    <Detail className="-mt-4">
                        Denne siden er ikke synlig i dev-gcp eller prod-gcp, kun lokal utvikling og demo
                    </Detail>

                    <div className="border border-border-subtle p-3 rounded-sm mt-2 bg-white">
                        <Heading level="2" size="small" className="-mt-7 bg-white w-fit px-2 py-0">
                            Scenarioer
                        </Heading>

                        {isSykInnApiIntegrationEnabled && (
                            <div className="border border-border-subtle p-3 rounded-sm mt-2">
                                <Heading size="small" className="-mt-7 bg-white w-fit px-2 py-0">
                                    You have enabled syk-inn-api localhost integration!
                                </Heading>
                                <BodyShort size="small" className="mt-2 mb-4">
                                    Disable{' '}
                                    <code className="text-sm bg-bg-subtle p-1 rounded-md">
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
                            <InfoCard data-color="info" className="mt-4" size="small">
                                <InfoCard.Header icon={<InformationSquareIcon aria-hidden />}>
                                    <InfoCard.Title>
                                        You have enabled local Valkey! Any scenarios that include drafts will not be a
                                        part of the scenario you launch.
                                    </InfoCard.Title>
                                </InfoCard.Header>
                                <InfoCard.Content>
                                    Set{' '}
                                    <code className="text-sm bg-bg-subtle p-1 rounded-md">USE_LOCAL_VALKEY=false</code>{' '}
                                    in your .env.development file to re-enable drafts in scenarios.
                                </InfoCard.Content>
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
