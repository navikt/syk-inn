'use client'

import React, { ReactElement } from 'react'
import { BodyShort, InfoCard } from '@navikt/ds-react'
import { ExclamationmarkTriangleIcon } from '@navikt/aksel-icons'

import { isLocal, isDemo } from '@lib/env'
import { raise } from '@lib/ts'
import { AkselNextLink } from '@components/links/AkselNextLink'

function DemoWarning(): ReactElement {
    if (!(isLocal || isDemo)) {
        raise(new Error('DemoWarning should only be rendered in local or demo environment'))
    }

    return (
        <div className="p-4  flex items-center justify-center w-full">
            <InfoCard data-color="warning">
                <InfoCard.Header icon={<ExclamationmarkTriangleIcon aria-hidden />}>
                    <InfoCard.Title>Dette er en demoside og inneholder ikke dine personlige data</InfoCard.Title>
                </InfoCard.Header>
                <InfoCard.Content>
                    <BodyShort>Denne siden skal kun brukest til øving eller demoer av applikasjonen.</BodyShort>
                    <AkselNextLink href="/dev" className="text-xs">
                        ← Back to development page
                    </AkselNextLink>
                </InfoCard.Content>
            </InfoCard>
        </div>
    )
}

export default DemoWarning
