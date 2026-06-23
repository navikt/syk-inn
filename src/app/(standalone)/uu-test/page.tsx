import { BodyShort, Checkbox, Heading, HelpText, Link } from '@navikt/ds-react'
import React, { ReactElement } from 'react'

function Page(): ReactElement {
    return (
        <section aria-labelledby="test-side-heading" className="p-4 max-w-prose">
            <Heading level="1" size="medium">
                Test-side for å sjekke tilgjengelighet på sjekkboks med HelpText-komponent nøstet.
            </Heading>
            <BodyShort>
                Komponenten under er en sjekkboks som har en HelpText-kompoment, inni HelpTexten sin PopOver er det også
                en hyperlenke.
            </BodyShort>
            <Checkbox>
                Sykmeldingen kan skyldes en yrkesskade/yrkessykdom
                <HelpText wrapperClassName="inline-block ml-1 align-middle">
                    Kryss av hvis en ny eller tidligere yrkesskade eller yrkessykdom kan være årsaken til
                    arbeidsuførheten. Du trenger ikke å vite om skaden eller sykdommen er godkjent av Nav. Les mer om
                    yrkesskade og yrkessykdom på{' '}
                    <Link
                        href="https://www.nav.no/samarbeidspartner/yrkesskade"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        nav.no
                    </Link>
                </HelpText>
            </Checkbox>
        </section>
    )
}

export default Page
