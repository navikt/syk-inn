import './globals.css'

import React, { ReactElement } from 'react'
import { BodyShort, Box, Heading, Link, List, VStack } from '@navikt/ds-react'
import { ListItem } from '@navikt/ds-react/List'
import { BugIcon } from '@navikt/aksel-icons'
import { PageBlock } from '@navikt/ds-react/Page'
import { Metadata } from 'next'

import { isDemo, isLocal } from '@lib/env'
import DemoWarning from '@components/user-warnings/DemoWarning'

import Preload from './preload'

export const metadata: Metadata = {
    title: 'Siden ble ikke funnet - Innsending av sykmeldinger',
    description: 'Denne siden kan være slettet eller flyttet, eller det er en feil i lenken.',
}

// TODO: Why is this not rendered in production when layout throws 404?
function GlobalNotFound(): ReactElement {
    return (
        <html lang="nb" className="bg-ax-bg-neutral-soft">
            <head>
                <link rel="icon" href="https://cdn.nav.no/personbruker/decorator-next/public/favicon.ico" sizes="any" />
                <link
                    rel="icon"
                    href="https://cdn.nav.no/personbruker/decorator-next/public/favicon.svg"
                    type="image/svg+xml"
                />
            </head>
            <Preload />
            <body>
                {(isLocal || isDemo) && <DemoWarning />}
                <PageBlock as="main" width="xl" gutters>
                    <Box paddingBlock="space-20 space-16">
                        <VStack gap="space-16">
                            <VStack gap="space-12" align="start">
                                <div>
                                    <Heading level="1" size="large" spacing>
                                        Beklager, vi fant ikke siden
                                    </Heading>
                                    <BodyShort>
                                        Denne siden kan være slettet eller flyttet, eller det er en feil i lenken.
                                    </BodyShort>
                                    <List className="py-4">
                                        <ListItem>Bruk gjerne søket eller menyen</ListItem>
                                        <ListItem>
                                            <Link href="https://nav.no/samarbeidspartner">Gå til forsiden</Link>
                                        </ListItem>
                                    </List>
                                </div>

                                <Link href="https://www.nav.no/person/kontakt-oss/nb/tilbakemeldinger/feil-og-mangler">
                                    <BugIcon aria-hidden />
                                    Meld gjerne fra om at lenken ikke virker
                                </Link>
                            </VStack>

                            <div>
                                <Heading level="2" size="large" spacing>
                                    Page not found
                                </Heading>
                                <BodyShort spacing>The page you requested cannot be found.</BodyShort>
                                <BodyShort>
                                    Go to the <Link href="https://nav.no/samarbeidspartner">front page</Link>, or use
                                    one of the links in the menu.
                                </BodyShort>
                            </div>
                        </VStack>
                    </Box>
                </PageBlock>
            </body>
        </html>
    )
}

export default GlobalNotFound
