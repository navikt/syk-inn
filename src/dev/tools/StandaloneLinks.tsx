'use client'

import React, { ReactElement } from 'react'
import { Heading, LinkCard } from '@navikt/ds-react'
import { PlayIcon, ShieldLockIcon } from '@navikt/aksel-icons'

import { pathWithBasePath } from '@lib/url'

function StandaloneLinks(): ReactElement {
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
                    <LinkCard.Anchor suppressHydrationWarning href={pathWithBasePath(`/ny`)}>
                        Just go
                    </LinkCard.Anchor>
                </LinkCard.Title>
                <LinkCard.Description>Starts a basic standalone sykmelding</LinkCard.Description>
            </LinkCard>
        </div>
    )
}

export default StandaloneLinks
