'use client'

import React, { ReactElement, useEffect, useRef } from 'react'
import { Heading, LinkCard, Select } from '@navikt/ds-react'
import { FlowerPetalsIcon, PlayIcon } from '@navikt/aksel-icons'
import Image from 'next/image'
import { parseAsString, useQueryState } from 'nuqs'

import { getAbsoluteURL, pathWithBasePath } from '@lib/url'

import { scenarios } from '../mock-engine/scenarios/scenarios'

function ScenarioLinks(): ReactElement {
    const [pasient, setPasient] = useQueryState(
        'pasient',
        parseAsString.withDefault('espen').withOptions({ clearOnDefault: true }),
    )

    const justLaunchRef = useRef<HTMLAnchorElement>(null)
    useEffect(() => {
        if (justLaunchRef.current) {
            justLaunchRef.current.focus()
        }
    }, [])

    return (
        <div className="mt-2">
            <div className="flex justify-between">
                <Heading level="3" size="xsmall" spacing className="flex gap-1 items-center">
                    <Image src="https://cdn.nav.no/tsm/syk-inn/dass.gif" alt="" width="32" height="32" unoptimized />
                    FHIR scenarioer
                </Heading>
                <div className="">
                    <Select
                        label="Pasient"
                        size="small"
                        hideLabel
                        onChange={(e) => setPasient(e.target.value)}
                        value={pasient}
                    >
                        <option value="espen">Espen Eksempel</option>
                        <option value="kari">Kari Normann</option>
                    </Select>
                </div>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
                <LinkCard>
                    <LinkCard.Icon>
                        <PlayIcon fontSize="2rem" />
                    </LinkCard.Icon>
                    <LinkCard.Title>
                        <LinkCard.Anchor
                            ref={justLaunchRef}
                            href={pathWithBasePath(`${fhirLaunchUrl}&launch=local-dev-launch-${pasient}`)}
                        >
                            Just launch
                        </LinkCard.Anchor>
                    </LinkCard.Title>
                    <LinkCard.Description>Just re-launches FHIR, does not change your scenario</LinkCard.Description>
                </LinkCard>
                {Object.entries(scenarios).map(([scenarioKey, scenario]) => (
                    <LinkCard key={scenarioKey}>
                        <LinkCard.Icon>
                            <FlowerPetalsIcon fontSize="2rem" />
                        </LinkCard.Icon>
                        <LinkCard.Title>
                            <LinkCard.Anchor href={createScenarioUrl(scenarioKey, pasient)}>
                                {scenarioKey}
                            </LinkCard.Anchor>
                        </LinkCard.Title>
                        <LinkCard.Description>{scenario.description}</LinkCard.Description>
                    </LinkCard>
                ))}
            </div>
        </div>
    )
}

const fhirLaunchUrl = `/fhir/launch?iss=${`${getAbsoluteURL()}/api/mocks/fhir`}` as const

function createScenarioUrl(scenario: string, pasient: string): string {
    return pathWithBasePath(
        `/set-scenario/${scenario}?returnTo=${encodeURIComponent(`${fhirLaunchUrl}&launch=local-dev-launch-${pasient}`)}`,
    )
}

export default ScenarioLinks
