'use client'

import { ReactElement, useState } from 'react'
import { BodyShort, Button, Checkbox, InfoCard, InlineMessage } from '@navikt/ds-react'
import { InformationSquareIcon } from '@navikt/aksel-icons'
import { AnimatePresence } from 'motion/react'
import { logger } from '@navikt/next-logger'

import { ActualBruksvilkar, BRUKSVILKAR_TIMESTAMP, BRUKSVILKAR_VERSION } from '@features/bruksvilkar/BruksvilkarInfo'
import { toReadableDateTime } from '@lib/date'
import { SimpleReveal } from '@components/animation/Reveal'
import { AssableNextLink } from '@components/links/AssableNextLink'
import { pathWithBasePath } from '@lib/url'
import { createFhirPaths } from '@core/providers/ModePaths'
import { SimpleAlert } from '@components/help/GeneralErrors'
import { cn } from '@lib/tw'

type Props = {
    patientId: string
    accepter: {
        hpr: string
        name: string
    }
    accepted: {
        at: string
        version: string
        stale: boolean
    } | null
}

function Bruksvilkar({ patientId, accepter, accepted }: Props): ReactElement {
    const paths = createFhirPaths(patientId)
    const [acceptOk, setAcceptOk] = useState<{ version: string; at: string; stale: boolean } | null>(accepted)

    return (
        <div className="max-w-prose">
            <div
                className={cn({
                    'mb-6': acceptOk == null,
                })}
            >
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
            {acceptOk != null && <YouAcceptedBruksvilkar version={acceptOk.version} at={acceptOk.at} />}
            <ActualBruksvilkar />
            <InlineMessage
                status="info"
                className="border border-ax-border-info-subtle rounded-sm p-2 italic mt-4 mb-4"
            >
                Du er {accepter.name} med HPR-nummer {accepter.hpr}
            </InlineMessage>
            {acceptOk == null ? (
                <AcceptBruksvilkar
                    patientId={patientId}
                    onAcceptOk={(accept) => setAcceptOk({ ...accept, stale: false })}
                />
            ) : (
                <YouAcceptedBruksvilkar version={acceptOk.version} at={acceptOk.at} />
            )}
            {acceptOk?.stale === true && (
                <div>
                    <InfoCard data-color="info">
                        <InfoCard.Header>
                            <InfoCard.Title>Oppdaterte bruksvilkår</InfoCard.Title>
                        </InfoCard.Header>
                        <InfoCard.Content>
                            <BodyShort spacing>
                                Bruksvilkårene ble oppdatert {toReadableDateTime(BRUKSVILKAR_TIMESTAMP)} til v
                                {BRUKSVILKAR_VERSION}. For å fortsette å bruke løsningen må du godta de oppdaterte
                                bruksvilkårene.
                            </BodyShort>
                            <AcceptBruksvilkar
                                patientId={patientId}
                                onAcceptOk={(accept) => setAcceptOk({ ...accept, stale: false })}
                            />
                        </InfoCard.Content>
                    </InfoCard>
                </div>
            )}

            <AnimatePresence>
                {acceptOk != null && !acceptOk.stale && (
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

function AcceptBruksvilkar({
    patientId,
    onAcceptOk,
}: {
    patientId: string
    onAcceptOk: (accept: { version: string; at: string }) => void
}): ReactElement {
    const paths = createFhirPaths(patientId)
    const [toggledAccept, setToggledAccept] = useState(false)
    const [accepting, setAccepting] = useState(false)
    const [acceptError, setAcceptError] = useState<string | null>(null)

    return (
        <>
            <div className="flex gap-3 items-center">
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
                        setAcceptError(null)
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
                            onAcceptOk({ at: result.acceptedAt, version: result.version })
                        } catch (e) {
                            logger.error(e)
                            setAcceptError('Noe gikk galt ved innsending av aksept, prøv igjen senere!')
                        } finally {
                            setAccepting(false)
                        }
                    }}
                >
                    Send inn
                </Button>
            </div>
            <AnimatePresence>
                {acceptError && (
                    <SimpleReveal>
                        <SimpleAlert
                            title="Feil ved godkjenning av bruksvilkår"
                            noSessionId
                            level="error"
                            className="mb-2"
                        >
                            Vi klarte ikke å lagre din godkjenning av bruksvilkårene akkurat nå. Prøv igjen senere.
                        </SimpleAlert>
                    </SimpleReveal>
                )}
            </AnimatePresence>
        </>
    )
}

function YouAcceptedBruksvilkar({ at, version }: { at: string; version: string }): ReactElement {
    return (
        <InlineMessage status="success" className="border border-ax-border-info-subtle rounded-sm p-2 italic mt-4 mb-4">
            Du godtok versjon {version} av bruksvilkårene <span>{toReadableDateTime(at)}</span>
        </InlineMessage>
    )
}

export default Bruksvilkar
