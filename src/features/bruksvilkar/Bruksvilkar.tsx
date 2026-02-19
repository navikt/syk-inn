'use client'

import { ReactElement, useState } from 'react'
import { BodyShort, Button, InfoCard, InlineMessage } from '@navikt/ds-react'
import { InformationSquareIcon } from '@navikt/aksel-icons'
import { AnimatePresence } from 'motion/react'

import {
    BRUKSVILKAR_TIMESTAMP,
    BRUKSVILKAR_VERSION,
    BruksvilkarSection,
} from '@features/bruksvilkar/BruksvilkarSection'
import { toReadableDateTime } from '@lib/date'
import { SimpleReveal } from '@components/animation/Reveal'
import { AssableNextLink } from '@components/links/AssableNextLink'
import { createFhirPaths } from '@core/providers/ModePaths'
import { cn } from '@lib/tw'
import { AcceptBruksvilkar } from '@features/bruksvilkar/BruksvilkarAccept'

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
            <BruksvilkarSection />
            <section aria-label="Godta bruksvilkår">
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
                )}

                <AnimatePresence>
                    {acceptOk != null && !acceptOk.stale && (
                        <SimpleReveal>
                            <Button
                                role="link"
                                href={paths.root}
                                className="w-full mt-4"
                                variant="secondary"
                                as={AssableNextLink}
                            >
                                Gå tilbake til pasienten
                            </Button>
                        </SimpleReveal>
                    )}
                </AnimatePresence>
            </section>
        </div>
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
