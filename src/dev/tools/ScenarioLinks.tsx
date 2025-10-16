'use client'

import React, { ReactElement, useEffect, useRef } from 'react'
import { Heading, LinkCard, Select } from '@navikt/ds-react'
import { FlowerPetalsIcon, PlayIcon } from '@navikt/aksel-icons'
import Image from 'next/image'
import { parseAsString, useQueryState } from 'nuqs'

import { MockLaunchType, MockOrganizations, MockPatients, MockPractitioners } from '@navikt/fhir-mock-server/types'
import { getAbsoluteURL, pathWithBasePath } from '@lib/url'

import { scenarios } from '../mock-engine/scenarios/scenarios'

function ScenarioLinks(): ReactElement {
    const [patient, setPatient] = useQueryState(
        'patient',
        parseAsString.withDefault('Espen Eksempel' satisfies MockPatients).withOptions({ clearOnDefault: true }),
    )
    const [practitioner, setPractitioner] = useQueryState(
        'practitioner',
        parseAsString.withDefault('').withOptions({ clearOnDefault: true }),
    )
    const [organization, setOrganization] = useQueryState(
        'organization',
        parseAsString.withDefault('').withOptions({ clearOnDefault: true }),
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
                <div className="flex gap-2 mb-4">
                    <Select
                        className="max-w-32"
                        label="Pasient"
                        size="small"
                        onChange={(e) => setPatient(e.target.value)}
                        value={patient}
                    >
                        <option value={'Espen Eksempel' satisfies MockPatients}>Espen Eksempel</option>
                        <option value={'Kari Normann' satisfies MockPatients}>Kari Normann</option>
                    </Select>
                    <Select
                        className="max-w-32"
                        label="Practitioner"
                        size="small"
                        onChange={(e) => setPractitioner(e.target.value)}
                        value={practitioner}
                    >
                        <option value="" disabled>
                            Default
                        </option>
                        <option value={'Magnar Koman' satisfies MockPractitioners}>Magnar Koman</option>
                        <option value={'Badette Organitto' satisfies MockPractitioners}>Badette</option>
                    </Select>
                    <Select
                        className="max-w-32"
                        label="Organization"
                        size="small"
                        onChange={(e) => setOrganization(e.target.value)}
                        value={organization}
                    >
                        <option value="" disabled>
                            Default
                        </option>
                        <option value={'Magnar Legekontor' satisfies MockOrganizations}>Magnar Legekontor</option>
                        <option value={'Karlsrud' satisfies MockOrganizations}>Karlsrud (feil lengde orgnr)</option>
                        <option value={'Manglerud' satisfies MockOrganizations}>
                            Manglerud (har feil lengde orgnr og uten tlf)
                        </option>
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
                            href={pathWithBasePath(
                                `${fhirLaunchUrl}&launch=${buildLaunchParam(
                                    patient as MockPatients,
                                    (practitioner || 'Magnar Koman') as MockPractitioners,
                                    (organization || 'Magnar Legekontor') as MockOrganizations,
                                )}`,
                            )}
                        >
                            Keep scenario
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
                            <LinkCard.Anchor
                                href={createScenarioUrl(
                                    scenarioKey,
                                    patient as MockPatients,
                                    (practitioner || 'Magnar Koman') as MockPractitioners,
                                    (organization || 'Magnar Legekontor') as MockOrganizations,
                                )}
                            >
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

function createScenarioUrl(
    scenario: string,
    patient: MockPatients,
    practitioner: MockPractitioners,
    organization: MockOrganizations,
): string {
    return pathWithBasePath(
        `/set-scenario/${scenario}?returnTo=${encodeURIComponent(
            `${fhirLaunchUrl}&launch=${buildLaunchParam(patient as MockPatients, practitioner, organization)}`,
        )}`,
    )
}

function buildLaunchParam(
    patient: MockPatients,
    practitioner: MockPractitioners,
    organization: MockOrganizations,
): MockLaunchType {
    return `local-dev-launch:${patient}:${practitioner}:${organization}`
}

export default ScenarioLinks
