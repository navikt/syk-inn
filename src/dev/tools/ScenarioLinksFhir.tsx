'use client'

import React, { ReactElement, useEffect, useRef, useState } from 'react'
import { Heading, LinkCard, Select, Link, Modal, Loader } from '@navikt/ds-react'
import { FlowerPetalsIcon, PlayIcon } from '@navikt/aksel-icons'
import Image from 'next/image'
import { parseAsString, useQueryState } from 'nuqs'

import { MockLaunchType, MockOrganizations, MockPatients, MockPractitioners } from '@navikt/fhir-mock-server/types'
import { getAbsoluteURL, pathWithBasePath } from '@lib/url'

import { scenarios } from '../mock-engine/scenarios/scenarios'

function ScenarioLinksFhir(): ReactElement {
    const [isLaunching, setIsLaunching] = useState<string | null>(null)

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
            <div className="flex flex-col ax-md:flex-row justify-between">
                <Heading level="3" size="medium" spacing className="flex gap-1 items-center">
                    <Image src="https://cdn.nav.no/tsm/syk-inn/dass.gif" alt="" width="48" height="48" unoptimized />
                    FHIR scenarioer
                </Heading>
                <div className="grid grid-cols-3 gap-2 mb-4 relative ax-md:max-w-2/3">
                    <Select label="Pasient" size="small" onChange={(e) => setPatient(e.target.value)} value={patient}>
                        <option value={'Espen Eksempel' satisfies MockPatients}>Espen Eksempel</option>
                        <option value={'Kari Normann' satisfies MockPatients}>Kari Normann</option>
                    </Select>
                    <Select
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
                    <Link
                        className="absolute -top-4 right-0 text-xs"
                        as="button"
                        type="button"
                        onClick={() => {
                            setPatient('Espen Eksempel' satisfies MockPatients)
                            setPractitioner('')
                            setOrganization('')
                        }}
                    >
                        Reset
                    </Link>
                </div>
            </div>
            <div className="grid ax-md:grid-cols-2 gap-3">
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
                            onClick={() => setIsLaunching('keep previous')}
                        >
                            Keep scenario
                        </LinkCard.Anchor>
                    </LinkCard.Title>
                    <LinkCard.Description className="text-sm ax-sm:text-base">
                        Just re-launches FHIR, does not change your scenario
                    </LinkCard.Description>
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
                                onClick={() => setIsLaunching(scenarioKey)}
                            >
                                {scenarioKey}
                            </LinkCard.Anchor>
                        </LinkCard.Title>
                        <LinkCard.Description className="text-sm ax-sm:text-base">
                            {scenario.description}
                        </LinkCard.Description>
                    </LinkCard>
                ))}
            </div>
            <Modal
                open={isLaunching != null}
                header={{
                    heading: 'Launching...',
                    closeButton: false,
                    size: 'small',
                    icon: <Loader size="medium" />,
                }}
                onClose={() => void 0}
            >
                <Modal.Body>
                    <dl className="grid grid-cols-[6rem_1fr] gap-x-6 gap-y-2">
                        <dt className="font-medium text-bold">Scenario</dt>
                        <dd className="italic">{isLaunching ?? 'Unknown'}</dd>
                        <dt className="font-medium text-bold">Patient</dt>
                        <dd className="italic">{patient}</dd>
                        <dt className="font-medium text-bold">Practitioner</dt>
                        <dd className="italic">{practitioner || 'Default (Magnar Koman)'}</dd>
                        <dt className="font-medium text-bold">Organization</dt>
                        <dd className="italic">{organization || 'Default (Magnar Legekontor)'}</dd>
                    </dl>
                </Modal.Body>
            </Modal>
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
        `/dev/set-scenario/${scenario}?returnTo=${encodeURIComponent(
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

export default ScenarioLinksFhir
