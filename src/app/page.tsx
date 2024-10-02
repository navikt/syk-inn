import { BodyShort, Heading } from '@navikt/ds-react'
import { VirusIcon } from '@navikt/aksel-icons'
import { ReactElement } from 'react'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'

import { bundledEnv, isLocalOrDemo } from '@utils/env'
import { getBaseURL } from '@utils/url'

export default function Home(): ReactElement {
    if (!isLocalOrDemo) {
        notFound()
    }

    return (
        <div className="flex gap-3 p-3 flex-col">
            <Heading level="1" size="xlarge" className="flex gap-2 items-center">
                <VirusIcon />
                syk-inn debug page
            </Heading>

            <BodyShort size="small">
                Rendering mode:{' '}
                <span className="font-bold">{cookies().get('development-mode-override')?.value ?? 'standalone'}</span>
            </BodyShort>

            <div className="flex flex-col gap-3">
                <Link href={`/fhir/launch?iss=${getBaseURL()}/api/fhir-mock`}>
                    Go to FHIR Launch? (client side navigation)
                </Link>
                <a
                    href={`${bundledEnv.NEXT_PUBLIC_BASE_PATH ?? ''}/fhir/launch?iss=${getBaseURL()}${bundledEnv.NEXT_PUBLIC_BASE_PATH ?? ''}/api/fhir-mock`}
                >
                    Go to FHIR Launch? (full page refresh)
                </a>
            </div>
        </div>
    )
}
