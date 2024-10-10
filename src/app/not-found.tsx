import React, { ReactElement } from 'react'
import { BugIcon } from '@navikt/aksel-icons'
import { BodyShort, Box, Heading, Link, List, VStack } from '@navikt/ds-react'
import { PageBlock } from '@navikt/ds-react/Page'
import { ListItem } from '@navikt/ds-react/List'

/**
 * TODO: These error pages for 404 and 500 should probably be rendered differently based on rendering context (FHIR vs standalone)
 */
function NotFound(): ReactElement {
    return (
        <PageBlock as="main" width="xl" gutters>
            <Box paddingBlock="20 16" data-aksel-template="404-v2">
                <VStack gap="16">
                    <VStack gap="12" align="start">
                        <div>
                            <Heading level="1" size="large" spacing>
                                Beklager, vi fant ikke siden
                            </Heading>
                            <BodyShort>
                                Denne siden kan være slettet eller flyttet, eller det er en feil i lenken.
                            </BodyShort>
                            <List>
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
                            Go to the <Link href="https://nav.no/samarbeidspartner">front page</Link>, or use one of the
                            links in the menu.
                        </BodyShort>
                    </div>
                </VStack>
            </Box>
        </PageBlock>
    )
}

export default NotFound
