import React, { ReactElement } from 'react'
import { Heading } from '@navikt/ds-react'
import { Page, PageBlock } from '@navikt/ds-react/Page'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'

import { getNameFromFhir } from '@data-layer/fhir/mappers/patient'

import { getMockStore } from '../../../api/mocks/fhir/[[...path]]/mock-storage'

export const metadata: Metadata = {
    title: 'Debug: Session Info',
}

async function SessionDebugPage({ searchParams }: PageProps<'/dev/mock/session'>): Promise<ReactElement> {
    const { sessionId } = await searchParams

    const store = getMockStore()
    const session = store.getSession(sessionId as string)
    if (session === null) notFound()

    return (
        <Page className="bg-transparent">
            <PageBlock as="main" width="xl" gutters>
                <div className="flex gap-6 p-4 ax-sm:p-6 ax-md:p-8 flex-col bg-ax-bg-default rounded-xl">
                    <Heading level="1" size="small" className="flex gap-2 items-center">
                        Detaljer for session ({session.encounter.id})
                    </Heading>
                    <div>
                        <Heading level="2" size="xsmall">
                            {getNameFromFhir(session.practitioner.name)} → {getNameFromFhir(session.patient.name)}
                        </Heading>
                    </div>
                    <div>
                        <Heading level="2" size="xsmall">
                            DocumentReference
                        </Heading>
                        <div className="flex flex-col gap-3">
                            {session.documentReferences.length === 0 && <div>Ingen document references enda</div>}
                            {session.documentReferences.map((it) => (
                                <OverflowableJson key={it.id}>{it}</OverflowableJson>
                            ))}
                        </div>
                    </div>
                    <div>
                        <Heading level="2" size="xsmall">
                            QuestionnaireResponse
                        </Heading>
                        <div className="flex flex-col gap-3">
                            {session.questionnaireResponse.length === 0 && <div>Ingen questionnaire response enda</div>}
                            {session.questionnaireResponse.map((it) => (
                                <OverflowableJson key={it.id}>{it}</OverflowableJson>
                            ))}
                        </div>
                    </div>
                </div>
            </PageBlock>
        </Page>
    )
}

function OverflowableJson({ children }: { children: Record<string, unknown> }): ReactElement {
    return (
        <pre className="w-full p-2 overflow-auto h-80 bg-ax-bg-sunken p-2 rounded-md">
            {JSON.stringify(children, null, 2)}
        </pre>
    )
}

export default SessionDebugPage
