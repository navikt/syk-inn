'use client'

import React, { ReactElement } from 'react'
import { Heading } from '@navikt/ds-react'
import { LinkPanel, LinkPanelDescription, LinkPanelTitle } from '@navikt/ds-react/LinkPanel'

import { getAbsoluteURL, pathWithBasePath } from '@utils/url'

function ScenarioLinks(): ReactElement {
    return (
        <div className="border border-border-subtle p-3 rounded-sm mt-2">
            <Heading level="2" size="small" className="-mt-7 bg-white w-fit px-2 py-0">
                Examples
            </Heading>

            <div className="mt-2">
                <Heading level="3" size="xsmall" spacing>
                    🔥 Launch example FHIR modes
                </Heading>
                <div className="flex gap-3">
                    <LinkPanel
                        href={pathWithBasePath(
                            `/fhir/launch?iss=${`${getAbsoluteURL()}/api/mocks/fhir&launch=local-dev-id`}`,
                        )}
                        border
                        onClick={() => {
                            document.cookie = `development-mode-override=fhir; path=/`
                        }}
                    >
                        <LinkPanelTitle className="text-medium leading-5">Launch mot syk-inn FHIR-mock</LinkPanelTitle>
                        <LinkPanelDescription className="text-sm">
                            Har norske data, hardkodet testdata
                        </LinkPanelDescription>
                    </LinkPanel>
                    <LinkPanel
                        href={`${`${getAbsoluteURL()}/fhir/launch`}?iss=https%3A%2F%2Flaunch.smarthealthit.org%2Fv%2Fr4%2Ffhir&launch=WzAsImNkMDlmNWQ0LTU1ZjctNGEyNC1hMjVkLWE1YjY1YzdhODgwNSIsIiIsIkFVVE8iLDAsMCwwLCIiLCIiLCIiLCIiLCIiLCIiLCIiLDAsMSwiIl0`}
                        border
                        onClick={() => {
                            document.cookie = `development-mode-override=fhir; path=/`
                        }}
                    >
                        <LinkPanelTitle className="text-medium leading-5">
                            Launch mot launch.smarthealthit.org
                        </LinkPanelTitle>
                        <LinkPanelDescription className="text-sm">
                            Forhåndsdefinerte data, ekstern FHIR server
                        </LinkPanelDescription>
                    </LinkPanel>
                    <LinkPanel
                        href={`https://launch.smarthealthit.org/?launch=WzAsImNkMDlmNWQ0LTU1ZjctNGEyNC1hMjVkLWE1YjY1YzdhODgwNSIsIiIsIkFVVE8iLDAsMCwwLCIiLCIiLCIiLCIiLCIiLCIiLCIiLDAsMSwiIl0&launch_url=${`${getAbsoluteURL()}/fhir/launch`}`}
                        border
                        onClick={() => {
                            document.cookie = `development-mode-override=fhir; path=/`
                        }}
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
                <LinkPanel
                    href={pathWithBasePath('/ny')}
                    border
                    className="max-w-prose"
                    onClick={() => {
                        document.cookie = `development-mode-override=standalone; path=/`
                    }}
                >
                    <LinkPanelTitle className="text-medium leading-5">Enkel standalone</LinkPanelTitle>
                    <LinkPanelDescription className="text-sm">Med mocket HelseID</LinkPanelDescription>
                </LinkPanel>
            </div>
        </div>
    )
}

export default ScenarioLinks
