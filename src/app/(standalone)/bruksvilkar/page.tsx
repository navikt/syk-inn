import { BodyShort, Heading } from '@navikt/ds-react'
import { logger } from '@navikt/next-logger'
import React, { ReactElement } from 'react'
import * as R from 'remeda'

import { LegeOgBehandlerTelefonen } from '#components/help/LegeOgBehandlerTelefonen'
import { PageLayout } from '#components/layout/Page'
import { HelseIdPaths } from '#core/providers/ModePaths'
import { hasAcceptedBruksvilkar } from '#core/services/bruksvilkar/bruksvilkar-service'
import { getHelseIdBehandler } from '#data-layer/helseid/helseid-service'
import Bruksvilkar from '#features/bruksvilkar/Bruksvilkar'

async function Page(): Promise<ReactElement> {
    return (
        <PageLayout heading="Bruksvilkår" bg="white" size="fit">
            <div className="p-4 bg-ax-bg-default rounded-md">
                <BruksvilkarWithData />
            </div>
        </PageLayout>
    )
}

async function BruksvilkarWithData(): Promise<ReactElement> {
    const userInfo = await getHelseIdBehandler()
    if (userInfo == null) {
        logger.error(`User without valid HelseID info tried to access bruksvilkår`)
        return <BruksvilkarError />
    }

    if (userInfo.hpr == null) {
        logger.error(`User without valid HPR tried to access bruksvilkår`)
        return <BruksvilkarError />
    }

    const acceptedBruksvilkar = await hasAcceptedBruksvilkar(userInfo.hpr)

    return (
        <Bruksvilkar
            paths={R.pick(HelseIdPaths, ['root', 'bruksvilkar'])}
            accepter={{ hpr: userInfo.hpr, name: userInfo.navn }}
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
