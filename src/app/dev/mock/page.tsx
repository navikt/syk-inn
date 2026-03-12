import * as R from 'remeda'
import React, { ReactElement } from 'react'
import { notFound } from 'next/navigation'
import { Heading } from '@navikt/ds-react'
import { Page, PageBlock } from '@navikt/ds-react/Page'
import { LinkCard, LinkCardAnchor, LinkCardDescription, LinkCardTitle } from '@navikt/ds-react/LinkCard'
import { Metadata } from 'next'

import { isDemo, isLocal } from '@lib/env'
import { getNameFromFhir } from '@data-layer/fhir/mappers/patient'
import { pathWithBasePath } from '@lib/url'

import { getMockStore } from '../../api/mocks/fhir/[[...path]]/mock-storage'

export const metadata: Metadata = {
    title: 'Debug: Sessionvelger',
}

function MockPage(): ReactElement {
    if (!(isLocal || isDemo)) {
        notFound()
    }

    const store = getMockStore()
    const allSessions = R.pipe(
        store.getSessions(),
        R.mapValues((it) => ({
            practitioner: getNameFromFhir(it.practitioner.name),
            patient: getNameFromFhir(it.patient.name),
            encounter: it.encounter.id,
        })),
        R.entries(),
    )

    return (
        <Page className="bg-transparent">
            <PageBlock as="main" width="xl" gutters>
                <div className="flex gap-6 p-4 ax-sm:p-6 ax-md:p-8 flex-col bg-ax-bg-default rounded-xl">
                    <Heading level="1" size="small" className="flex gap-2 items-center">
                        FHIR Mock
                    </Heading>
                    {allSessions.length === 0 && <div>Ingen sessions enda</div>}
                    {allSessions.map(([sessionId, session]) => (
                        <LinkCard key={sessionId}>
                            <LinkCardTitle>
                                <LinkCardAnchor href={pathWithBasePath(`/dev/mock/session?sessionId=${sessionId}`)}>
                                    {session.practitioner} → {session.patient}
                                </LinkCardAnchor>
                            </LinkCardTitle>
                            <LinkCardDescription>{session.encounter}</LinkCardDescription>
                        </LinkCard>
                    ))}
                </div>
            </PageBlock>
        </Page>
    )
}

export default MockPage
