'use client'

import React, { ReactElement } from 'react'
import { Heading, LinkCard } from '@navikt/ds-react'
import { FlowerPetalsIcon, PlayIcon } from '@navikt/aksel-icons'

import { getAbsoluteURL, pathWithBasePath } from '@utils/url'

import { scenarios } from '../data-layer/mock-engine/scenarios/scenarios'

function ScenarioLinks(): ReactElement {
    return (
        <div className="border border-border-subtle p-3 rounded-sm mt-2">
            <Heading level="2" size="small" className="-mt-7 bg-white w-fit px-2 py-0">
                Scenarioer
            </Heading>

            <div className="mt-2">
                <Heading level="3" size="xsmall" spacing>
                    🔥 FHIR scenarioer
                </Heading>
                <div className="grid md:grid-cols-2 gap-3">
                    <LinkCard>
                        <LinkCard.Icon>
                            <PlayIcon fontSize="2rem" />
                        </LinkCard.Icon>
                        <LinkCard.Title>
                            <LinkCard.Anchor href={pathWithBasePath(fhirLaunchUrl)}>Just launch</LinkCard.Anchor>
                        </LinkCard.Title>
                        <LinkCard.Description>
                            Just re-launches FHIR, does not change your scenario
                        </LinkCard.Description>
                    </LinkCard>
                    {Object.entries(scenarios).map(([scenarioKey, scenario]) => (
                        <LinkCard key={scenarioKey}>
                            <LinkCard.Icon>
                                <FlowerPetalsIcon fontSize="2rem" />
                            </LinkCard.Icon>
                            <LinkCard.Title>
                                <LinkCard.Anchor href={createScenarioUrl(scenarioKey)}>{scenarioKey}</LinkCard.Anchor>
                            </LinkCard.Title>
                            <LinkCard.Description>{scenario.description}</LinkCard.Description>
                        </LinkCard>
                    ))}
                </div>
            </div>
        </div>
    )
}

export const fhirLaunchUrl = `/fhir/launch?iss=${`${getAbsoluteURL()}/api/mocks/fhir&launch=local-dev-id`}` as const

function createScenarioUrl(scenario: string): string {
    return pathWithBasePath(`/set-scenario/${scenario}?returnTo=${encodeURIComponent(fhirLaunchUrl)}`)
}

export default ScenarioLinks
