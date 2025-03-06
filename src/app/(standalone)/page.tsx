import { BodyShort, Detail, Heading } from '@navikt/ds-react'
import { VirusIcon } from '@navikt/aksel-icons'
import { ReactElement, Suspense } from 'react'
import { notFound } from 'next/navigation'
import { PageBlock } from '@navikt/ds-react/Page'

import { bundledEnv, isLocalOrDemo } from '@utils/env'

import ScenarioLinks from '../../devtools/ScenarioLinks'
import { getHelseIdWellKnown } from '../../helseid/helseid-resources'
import { getHelseIdUserInfo } from '../../helseid/helseid-userinfo'

export default function Home(): ReactElement {
    if (!isLocalOrDemo) {
        notFound()
    }

    return (
        <PageBlock as="main" width="xl" gutters>
            <div className="flex gap-3 p-3 flex-col">
                <Heading level="1" size="xlarge" className="flex gap-2 items-center">
                    <VirusIcon />
                    <div>
                        <span>Innsending av Sykmelding</span>
                        <Detail className="-mt-3">Development Page</Detail>
                    </div>
                </Heading>

                <div className="border border-border-subtle p-3 rounded-sm mt-2">
                    <Heading size="small" className="-mt-7 bg-white w-fit px-2 py-0">
                        Metadata
                    </Heading>
                    <BodyShort size="small" className="mt-2">
                        Runtime environment: <span className="font-bold">{bundledEnv.NEXT_PUBLIC_RUNTIME_ENV}</span>
                    </BodyShort>
                    <Suspense fallback={<div>Loading user info...</div>}>
                        <TestHelseIdUserInfo />
                    </Suspense>
                </div>

                <ScenarioLinks />
            </div>
        </PageBlock>
    )
}

async function TestHelseIdUserInfo(): Promise<ReactElement> {
    const wellKnown = await getHelseIdWellKnown()
    const userInfo = await getHelseIdUserInfo()

    return (
        <>
            <BodyShort size="small" className="mt-2">
                User info endpoint: <span className="font-bold">{wellKnown.userinfo_endpoint}</span>
            </BodyShort>
            <BodyShort size="small" className="mt-2">
                User info: <span className="font-bold">{JSON.stringify(userInfo)}</span>
            </BodyShort>
        </>
    )
}
