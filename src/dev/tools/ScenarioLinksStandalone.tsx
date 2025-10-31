'use client'

import React, { ReactElement } from 'react'
import { Heading, LinkCard, Select } from '@navikt/ds-react'
import { PlayIcon, ShieldLockIcon } from '@navikt/aksel-icons'
import { parseAsString, useQueryState } from 'nuqs'

import { MockBehandlere } from '@navikt/helseid-mock-server'
import { pathWithBasePath } from '@lib/url'

function ScenarioLinksStandalone(): ReactElement {
    const [behandler, setBehandler] = useQueryState(
        'behandler',
        parseAsString.withDefault('Johan Johansson' satisfies MockBehandlere).withOptions({ clearOnDefault: true }),
    )

    return (
        <div className="mt-4">
            <div className="flex justify-between">
                <Heading level="3" size="xsmall" spacing className="flex gap-1 items-center">
                    <ShieldLockIcon height="32" width="32" aria-hidden />
                    HelseID scenarioer
                </Heading>
                <div className="flex gap-2 mb-4 relative">
                    <Select
                        className="max-w-42"
                        label="Practitioner"
                        size="small"
                        onChange={(e) => setBehandler(e.target.value)}
                        value={behandler}
                    >
                        <option value={'Johan Johansson' satisfies MockBehandlere}>Johan Johansson</option>
                        <option value={'Ola Olsen' satisfies MockBehandlere}>Ola Olsen</option>
                        <option value={'Kari Karlsen' satisfies MockBehandlere}>Kari Karlsen</option>
                    </Select>
                </div>
            </div>
            <LinkCard>
                <LinkCard.Icon>
                    <PlayIcon fontSize="2rem" />
                </LinkCard.Icon>
                <LinkCard.Title>
                    <LinkCard.Anchor
                        suppressHydrationWarning
                        href={createScenarioUrl('empty', behandler as MockBehandlere)}
                    >
                        Just go
                    </LinkCard.Anchor>
                </LinkCard.Title>
                <LinkCard.Description>Starts a basic standalone sykmelding</LinkCard.Description>
            </LinkCard>
        </div>
    )
}

function createScenarioUrl(scenario: string, behandler: MockBehandlere): string {
    const helseIdMockUrl = pathWithBasePath(
        `/api/mocks/helseid/dev/start-user${buildInitParams(behandler as MockBehandlere)}`,
    )

    return pathWithBasePath(`/dev/set-scenario/${scenario}?returnTo=${encodeURIComponent(helseIdMockUrl)}`)
}

function buildInitParams(behandler: MockBehandlere): string {
    return `?user=${behandler}&returnTo=${pathWithBasePath('/')}`
}

export default ScenarioLinksStandalone
