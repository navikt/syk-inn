'use client'

import React, { ReactElement, useEffect } from 'react'
import { logger } from '@navikt/next-logger'
import { BodyShort, Box, Heading, HGrid, Link, List, VStack } from '@navikt/ds-react'
import { PageBlock } from '@navikt/ds-react/Page'
import { ListItem } from '@navikt/ds-react/List'

import SessionIdInfo from '@components/help/SessionIdInfo'

type Props = {
    error: Error & { digest?: string }
}

/**
 * TODO: These error pages for 404 and 500 should probably be rendered differently based on rendering context (FHIR vs standalone)
 */
function Error({ error }: Props): ReactElement {
    useEffect(() => {
        logger.error(error)
    }, [error])

    return (
        <PageBlock as="main" width="xl" gutters>
            <Box paddingBlock="space-20 space-8">
                <HGrid columns="minmax(auto,600px)" data-aksel-template="500-v2">
                    <VStack gap="space-16">
                        <VStack gap="space-12" align="start">
                            <div>
                                <BodyShort textColor="subtle" size="small">
                                    Statuskode 500
                                </BodyShort>
                                <Heading level="1" size="large" spacing>
                                    Beklager, noe gikk galt.
                                </Heading>
                                {/* Tekster bør tilpasses den aktuelle 500-feilen. Teksten under er for en generisk 500-feil. */}
                                <BodyShort spacing>
                                    En teknisk feil på våre servere gjør at siden er utilgjengelig. Dette skyldes ikke
                                    noe du gjorde.
                                </BodyShort>
                                <BodyShort>Du kan prøve å</BodyShort>
                                <List className="py-4">
                                    <ListItem>
                                        vente noen minutter og{' '}
                                        <Link href="#" onClick={() => location.reload()}>
                                            laste siden på nytt
                                        </Link>
                                    </ListItem>
                                    <ListItem>
                                        <Link href="#" onClick={() => history.back()}>
                                            gå tilbake til forrige side
                                        </Link>
                                    </ListItem>
                                </List>
                                <BodyShort>
                                    Hvis problemet vedvarer, kan du{' '}
                                    <Link href="https://www.nav.no/kontaktoss" target="_blank">
                                        kontakte oss (åpnes i ny fane)
                                    </Link>
                                    .
                                </BodyShort>
                            </div>

                            <SessionIdInfo />
                        </VStack>

                        <div>
                            <Heading level="1" size="large" spacing>
                                Something went wrong
                            </Heading>
                            <BodyShort spacing>
                                This was caused by a technical fault on our servers. Please refresh this page or try
                                again in a few minutes.{' '}
                            </BodyShort>
                            <BodyShort>
                                <Link target="_blank" href="https://www.nav.no/kontaktoss">
                                    Contact us (opens in new tab)
                                </Link>{' '}
                                if the problem persists.
                            </BodyShort>
                        </div>
                    </VStack>
                </HGrid>
            </Box>
        </PageBlock>
    )
}

export default Error
