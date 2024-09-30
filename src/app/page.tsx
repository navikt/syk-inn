import { Heading } from '@navikt/ds-react'
import { VirusIcon } from '@navikt/aksel-icons'
import { ReactElement } from 'react'
import { logger } from '@navikt/next-logger'
import Link from 'next/link'

export default function Home(): ReactElement {
    logger.info('Hello from page (RSC)')

    return (
        <div className="flex gap-3 p-3 flex-col">
            <Heading level="1" size="xlarge" spacing className="flex gap-2 items-center">
                <VirusIcon />
                syk-inn dev
            </Heading>

            <div className="flex flex-col gap-3">
                <Link href="/fhir/launch?iss=http://localhost:3000/api/fhir-mock">
                    Go to FHIR Launch? (client side navigation)
                </Link>
                <a href="/fhir/launch?iss=http://localhost:3000/api/fhir-mock">
                    Go to FHIR Launch? (full page refresh)
                </a>
            </div>
        </div>
    )
}
