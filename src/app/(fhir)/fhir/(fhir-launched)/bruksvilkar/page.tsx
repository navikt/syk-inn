import { BodyShort, Heading } from '@navikt/ds-react'
import { logger } from '@navikt/next-logger'
import React, { ReactElement } from 'react'
import * as R from 'remeda'

import { LegeOgBehandlerTelefonen } from '#components/help/LegeOgBehandlerTelefonen'
import { PageLayout } from '#components/layout/Page'
import { createFhirPaths } from '#core/providers/ModePaths'
import { hasAcceptedBruksvilkar } from '#core/services/bruksvilkar/bruksvilkar-service'
import { getNameFromFhir } from '#data-layer/fhir/mappers/patient'
import { getHpr } from '#data-layer/fhir/mappers/practitioner'
import { getReadyClient } from '#data-layer/fhir/smart/ready-client'
import Bruksvilkar from '#features/bruksvilkar/Bruksvilkar'

async function Page({ searchParams }: PageProps<'/fhir/bruksvilkar'>): Promise<ReactElement> {
    const { returnTo } = await searchParams

    return (
        <PageLayout heading="Bruksvilkår" bg="white" size="fit">
            <div className="p-4 bg-ax-bg-default rounded-md">
                {typeof returnTo === 'string' ? <BruksvilkarWithData patientId={returnTo} /> : <BruksvilkarError />}
            </div>
        </PageLayout>
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
            paths={R.pick(createFhirPaths(patientId), ['root', 'bruksvilkar'])}
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
        <div className="max-w-prose">
            <Heading size="medium" level="3" spacing>
                Kunne ikke vise bruksvilkår
            </Heading>
            <BodyShort spacing>Dette kan tyde på at det skjedde en feil under oppstarten av applikasjonen.</BodyShort>
            <LegeOgBehandlerTelefonen />
        </div>
    )
}

export default Page
