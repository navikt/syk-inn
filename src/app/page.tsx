import { BodyShort, Detail, Heading } from '@navikt/ds-react'
import { LinkPanel, LinkPanelDescription, LinkPanelTitle } from '@navikt/ds-react/LinkPanel'
import { VirusIcon } from '@navikt/aksel-icons'
import { ReactElement } from 'react'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'

import { bundledEnv, isLocalOrDemo } from '@utils/env'
import { getAbsoluteURL, urlWithBasePath } from '@utils/url'

export default function Home(): ReactElement {
    if (!isLocalOrDemo) {
        notFound()
    }

    const renderingMode = cookies().get('development-mode-override')?.value === 'fhir' ? 'fhir' : 'standalone'

    return (
        <div className="flex gap-3 p-3 flex-col">
            <Heading level="1" size="xlarge" className="flex gap-2 items-center">
                <VirusIcon />
                <div>
                    <span>Innsending av Sykmelding</span>
                    <Detail className="-mt-3">Development Page</Detail>
                </div>
            </Heading>

            <div className="border border-border-subtle p-3 rounded mt-2">
                <Heading size="small" className="-mt-7 bg-white w-fit px-2 py-0">
                    Metadata
                </Heading>
                <BodyShort size="small">
                    Rendering mode: <span className="font-bold">{renderingMode}</span>
                </BodyShort>
                {renderingMode === 'fhir' && <Detail>You should see custom internal header</Detail>}
                {renderingMode === 'standalone' && (
                    <Detail>You should see a nav.no-style decorator (header and footer)</Detail>
                )}
                <BodyShort size="small" className="mt-2">
                    Runtime environment: <span className="font-bold">{bundledEnv.NEXT_PUBLIC_RUNTIME_ENV}</span>
                </BodyShort>
            </div>

            <div className="border border-border-subtle p-3 rounded mt-2">
                <Heading level="2" size="small" className="-mt-7 bg-white w-fit px-2 py-0">
                    Examples
                </Heading>

                <div className="mt-2">
                    <Heading level="3" size="xsmall" spacing>
                        🔥 Launch example FHIR modes
                    </Heading>
                    <div className="flex gap-3">
                        <LinkPanel
                            href={urlWithBasePath(`/fhir/launch?iss=${`${getAbsoluteURL()}/api/fhir-mock`}`)}
                            border
                        >
                            <LinkPanelTitle className="text-medium leading-5">
                                Launch mot syk-inn FHIR-mock
                            </LinkPanelTitle>
                            <LinkPanelDescription className="text-sm">
                                Har norske data, hardkodet testdata
                            </LinkPanelDescription>
                        </LinkPanel>
                        <LinkPanel
                            href={`${`${getAbsoluteURL()}/fhir/launch`}?iss=https%3A%2F%2Flaunch.smarthealthit.org%2Fv%2Fr4%2Ffhir&launch=WzAsImNkMDlmNWQ0LTU1ZjctNGEyNC1hMjVkLWE1YjY1YzdhODgwNSIsIjI1MzEwNzEiLCJBVVRPIiwwLDAsMCwiIiwiIiwiIiwiIiwiIiwiIiwiIiwwLDEsIiJd`}
                            border
                        >
                            <LinkPanelTitle className="text-medium leading-5">
                                Launch mot launch.smarthealthit.org
                            </LinkPanelTitle>
                            <LinkPanelDescription className="text-sm">
                                Forhåndsdefinerte data, ekstern FHIR server
                            </LinkPanelDescription>
                        </LinkPanel>
                        <LinkPanel
                            href={`https://launch.smarthealthit.org/?launch=WzAsImNkMDlmNWQ0LTU1ZjctNGEyNC1hMjVkLWE1YjY1YzdhODgwNSIsIjI1MzEwNzEiLCJBVVRPIiwwLDAsMCwiIiwiIiwiIiwiIiwiIiwiIiwiIiwwLDEsIiJd&launch_url=${`${getAbsoluteURL()}/fhir/launch`}`}
                            border
                        >
                            <LinkPanelTitle className="text-medium leading-5">
                                Konfigurer launch.smarthealthit.org
                            </LinkPanelTitle>
                            <LinkPanelDescription className="text-sm">
                                Konfigurer smarthealthit.org launch
                            </LinkPanelDescription>
                        </LinkPanel>
                    </div>
                </div>
                <div className="mt-4">
                    <Heading level="3" size="xsmall" spacing>
                        ⚠️ Standalone examples
                    </Heading>
                    <LinkPanel as={Link} href="/ny" border className="max-w-prose">
                        <LinkPanelTitle className="text-medium leading-5">Enkel standalone</LinkPanelTitle>
                        <LinkPanelDescription className="text-sm">Med mocket HelseID</LinkPanelDescription>
                    </LinkPanel>
                </div>
            </div>
        </div>
    )
}
