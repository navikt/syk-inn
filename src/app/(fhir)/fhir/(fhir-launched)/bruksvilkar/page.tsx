import React, { ReactElement } from 'react'
import { PageBlock } from '@navikt/ds-react/Page'
import { BodyShort, Heading } from '@navikt/ds-react'
import { logger } from '@navikt/next-logger'

import { isDemo, isLocal } from '@lib/env'
import DemoWarning from '@components/user-warnings/DemoWarning'
import { PageLayout } from '@components/layout/Page'
import Bruksvilkar from '@features/bruksvilkar/Bruksvilkar'
import LegeOgBehandlerTelefonen from '@components/help/LegeOgBehandlerTelefonen'
import { getReadyClient } from '@data-layer/fhir/smart/ready-client'
import { getHpr } from '@data-layer/fhir/mappers/practitioner'
import { hasAcceptedBruksvilkar } from '@core/services/bruksvilkar/bruksvilkar-service'
import { getNameFromFhir } from '@data-layer/fhir/mappers/patient'

async function Page({ searchParams }: PageProps<'/fhir/bruksvilkar'>): Promise<ReactElement> {
    const { returnTo } = await searchParams

    return (
        <div>
            {(isLocal || isDemo) && <DemoWarning />}
            <PageLayout heading="Bruksvilkår" bg="white" size="fit">
                <div className="p-4 bg-ax-bg-default rounded-md">
                    {typeof returnTo === 'string' ? <BruksvilkarWithData patientId={returnTo} /> : <BruksvilkarError />}
                </div>
            </PageLayout>
        </div>
    )
}

async function BruksvilkarWithData({ patientId }: { patientId: string }): Promise<ReactElement> {
    const readyClient = await getReadyClient(patientId)
    if ('error' in readyClient) {
        logger.error(`Tried to load bruksvilkår, got ${readyClient.error}`)
        return <BruksvilkarError />
    }

    const practitioner = await readyClient.user.request()
    if ('error' in practitioner) {
        logger.error(`Tried to load bruksvilkår, got ${practitioner.error}`)
        return <BruksvilkarError />
    }

    const hpr = getHpr(practitioner.identifier)
    if (!hpr) {
        logger.error(`Tried to load bruksvilkår, got practitioner without HPR: ${practitioner.id}`)
        return <BruksvilkarError />
    }

    const acceptedBruksvilkar = await hasAcceptedBruksvilkar(hpr)

    return (
        <Bruksvilkar
            patientId={patientId}
            accepter={{
                hpr: hpr,
                name: getNameFromFhir(practitioner.name),
            }}
            accepted={
                acceptedBruksvilkar?.acceptedAt != null
                    ? {
                          at: acceptedBruksvilkar.acceptedAt,
                          version: acceptedBruksvilkar.version,
                          stale: acceptedBruksvilkar.stale,
                      }
                    : null
            }
        />
    )
}

function BruksvilkarError(): ReactElement {
    return (
        <PageBlock as="main" width="xl" gutters className="pt-4">
            <div className="max-w-prose">
                <Heading size="medium" level="3" spacing>
                    Kunne ikke vise bruksvilkår
                </Heading>
                <BodyShort spacing>
                    Dette kan tyde på at det skjedde en feil under oppstarten av applikasjonen.
                </BodyShort>
                <LegeOgBehandlerTelefonen />
            </div>
        </PageBlock>
    )
}

export default Page
