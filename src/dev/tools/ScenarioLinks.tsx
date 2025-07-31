'use client'

import React, { ReactElement, useEffect, useRef } from 'react'
import { Heading, LinkCard } from '@navikt/ds-react'
import { FlowerPetalsIcon, PlayIcon } from '@navikt/aksel-icons'
import Image from 'next/image'

import { getAbsoluteURL, pathWithBasePath } from '@lib/url'

import { scenarios } from '../mock-engine/scenarios/scenarios'

function ScenarioLinks(): ReactElement {
    const justLaunchRef = useRef<HTMLAnchorElement>(null)
    useEffect(() => {
        if (justLaunchRef.current) {
            justLaunchRef.current.focus()
        }
    }, [])

    return (
        <div className="border border-border-subtle p-3 rounded-sm mt-2">
            <Heading level="2" size="small" className="-mt-7 bg-white w-fit px-2 py-0">
                Scenarioer
            </Heading>

            <div className="mt-2">
                <Heading level="3" size="xsmall" spacing className="flex gap-1 items-center">
                    <Image src="https://cdn.nav.no/tsm/syk-inn/dass.gif" alt="" width="32" height="32" unoptimized />
                    FHIR scenarioer
                </Heading>
                <div className="grid md:grid-cols-2 gap-3">
                    <LinkCard>
                        <LinkCard.Icon>
                            <PlayIcon fontSize="2rem" />
                        </LinkCard.Icon>
                        <LinkCard.Title>
                            <LinkCard.Anchor ref={justLaunchRef} href={pathWithBasePath(fhirLaunchUrl)}>
                                Just launch
                            </LinkCard.Anchor>
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

const fhirLaunchUrl = `/fhir/launch?iss=${`${getAbsoluteURL()}/api/mocks/fhir&launch=local-dev-id`}` as const

function createScenarioUrl(scenario: string): string {
    return pathWithBasePath(`/set-scenario/${scenario}?returnTo=${encodeURIComponent(fhirLaunchUrl)}`)
}

export default ScenarioLinks
