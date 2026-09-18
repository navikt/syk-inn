'use client'

import { PlayIcon, ShieldLockIcon } from '@navikt/aksel-icons'
import { Heading, LinkCard } from '@navikt/ds-react'
import React, { ReactElement } from 'react'

import { createHelseIDScenarioUrl } from './scenario-url-utils'

export function ScenarioLinksStandalone(): ReactElement {
    return (
        <div className="mt-4">
            <Heading level="3" size="xsmall" spacing className="flex gap-1 items-center">
                <ShieldLockIcon height="32" width="32" aria-hidden />
                HelseID scenarioer
            </Heading>
            <LinkCard>
                <LinkCard.Icon>
                    <PlayIcon fontSize="2rem" />
                </LinkCard.Icon>
                <LinkCard.Title>
                    <LinkCard.Anchor suppressHydrationWarning href={createHelseIDScenarioUrl('empty')}>
                        Just go
                    </LinkCard.Anchor>
                </LinkCard.Title>
                <LinkCard.Description className="text-sm ax-sm:text-base">
                    Starts a basic standalone sykmelding
                </LinkCard.Description>
            </LinkCard>
        </div>
    )
}
