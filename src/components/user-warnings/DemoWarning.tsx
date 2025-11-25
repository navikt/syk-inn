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
            <InfoCard data-color="warning" size="small">
                <InfoCard.Header icon={<ExclamationmarkTriangleIcon aria-hidden />}>
                    <InfoCard.Title>Demoside for test</InfoCard.Title>
                </InfoCard.Header>
                <InfoCard.Content>
                    <BodyShort>
                        Dette er en demo-applikasjon med falsk data, og skal kun brukes til demo og test.
                    </BodyShort>
                    <AkselNextLink href="/dev" className="text-xs">
                        ← Back to development page
                    </AkselNextLink>
                </InfoCard.Content>
            </InfoCard>
        </div>
    )
}

export default DemoWarning
