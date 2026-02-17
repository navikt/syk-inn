'use client'

import { ReactElement, useState } from 'react'
import { Button, Checkbox, InfoCard, InlineMessage } from '@navikt/ds-react'
import { InformationSquareIcon } from '@navikt/aksel-icons'
import { AnimatePresence } from 'motion/react'

import { ActualBruksvilkar, BRUKSVILKAR_VERSION } from '@features/bruksvilkar/BruksvilkarInfo'
import { toReadableDateTime } from '@lib/date'
import { SimpleReveal } from '@components/animation/Reveal'
import { AssableNextLink } from '@components/links/AssableNextLink'
import { pathWithBasePath } from '@lib/url'
import { createFhirPaths } from '@core/providers/ModePaths'

type Props = {
    patientId: string
    accepter: {
        hpr: string
        name: string
    }
    accepted: {
        at: string
        version: string
    } | null
}

function Bruksvilkar({ patientId, accepter, accepted }: Props): ReactElement {
    const paths = createFhirPaths(patientId)
    const [acceptOk, setAcceptOk] = useState<{ version: string; at: string } | null>(accepted)
    const [toggledAccept, setToggledAccept] = useState(false)
    const [accepting, setAccepting] = useState(false)

    return (
        <div className="max-w-prose">
            <div className="mb-6">
                <InfoCard data-color="info">
                    <InfoCard.Header icon={<InformationSquareIcon aria-hidden />}>
                        <InfoCard.Title>Velkommen til pilot</InfoCard.Title>
                    </InfoCard.Header>
                    <InfoCard.Content>
                        For å kunne begynne å bruke denne løsningen, må du godta bruksvilkårene for piloten. Det gjør du
                        ved å scrolle ned og krysse av i boksen nederst på siden.
                    </InfoCard.Content>
                </InfoCard>
            </div>
            <ActualBruksvilkar />
            <InlineMessage
                status="info"
                className="border border-ax-border-info-subtle rounded-sm p-2 italic mt-4 mb-4"
            >
                Du er {accepter.name} med HPR-nummer {accepter.hpr}
            </InlineMessage>
            {acceptOk == null ? (
                <div className="mx-2 mb-2 flex gap-3 items-center">
                    <Checkbox
                        className="flex items-center"
                        data-color="accent"
                        value={toggledAccept}
                        onChange={() => setToggledAccept((b) => !b)}
                    >
                        Jeg bekrefter at jeg godtar disse bruksvilkårene, og ønsker å være en pilotbruker.
                    </Checkbox>
                    <Button
                        className="shrink-0 h-fit"
                        disabled={!toggledAccept}
                        loading={accepting}
                        onClick={async () => {
                            setAccepting(true)

                            try {
                                const response = await fetch(pathWithBasePath(paths.bruksvilkar.accept), {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        patientId,
                                        version: BRUKSVILKAR_VERSION,
                                    }),
                                })

                                const result = await response.json()
                                setAcceptOk({
                                    at: result.acceptedAt,
                                    version: result.version,
                                })
                            } finally {
                                setAccepting(false)
                            }
                        }}
                    >
                        Send inn
                    </Button>
                </div>
            ) : (
                <div className="p-4">
                    <InlineMessage status="success">
                        Du godtok versjon {acceptOk.version} av bruksvilkårene{' '}
                        <span>{toReadableDateTime(acceptOk.at)}</span>
                    </InlineMessage>
                </div>
            )}
            <AnimatePresence>
                {acceptOk != null && (
                    <SimpleReveal>
                        <Button href={paths.root} className="w-full mt-4" variant="secondary" as={AssableNextLink}>
                            Gå tilbake til pasienten
                        </Button>
                    </SimpleReveal>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Bruksvilkar
