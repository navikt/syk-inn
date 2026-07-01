'use client'

import { InformationSquareIcon } from '@navikt/aksel-icons'
import { BodyShort, Button, InfoCard, InlineMessage } from '@navikt/ds-react'
import { AnimatePresence } from 'motion/react'
import { ReactElement, useState } from 'react'

import { SimpleReveal } from '#components/animation/Reveal'
import { AssableNextLink } from '#components/links/AssableNextLink'
import { ModePaths } from '#core/providers/ModePaths'
import { toReadableDateTime } from '#lib/date'
import { cn } from '#lib/tw'

import { AcceptBruksvilkar } from './BruksvilkarAccept'
import { BRUKSVILKAR_TIMESTAMP, BRUKSVILKAR_VERSION, BruksvilkarSection } from './BruksvilkarSection'

type Props = {
    paths: Pick<ModePaths, 'root' | 'bruksvilkar'>
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

function Bruksvilkar({ paths, accepter, accepted }: Props): ReactElement {
    const [acceptOk, setAcceptOk] = useState<{ version: string; at: string; stale: boolean } | null>(accepted)

    return (
        <div className="max-w-prose">
            <div className={cn({ 'mb-6': acceptOk == null })}>
                <InfoCard data-color="info">
                    <InfoCard.Header icon={<InformationSquareIcon aria-hidden />}>
                        <InfoCard.Title>Velkommen til ny sykemeldingsløsning</InfoCard.Title>
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
                        paths={paths.bruksvilkar}
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
                                paths={paths.bruksvilkar}
                                onAcceptOk={(accept) => setAcceptOk({ ...accept, stale: false })}
                            />
                        </InfoCard.Content>
                    </InfoCard>
                )}

                <AnimatePresence>
                    {acceptOk != null && !acceptOk.stale && (
                        <SimpleReveal>
                            <Button href={paths.root} className="w-full mt-4" variant="secondary" as={AssableNextLink}>
                                Gå videre til sykemeldingsløsningen
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
