'use client'

import { PageBlock } from '@navikt/ds-react/Page'
import React, { ReactElement } from 'react'
import { BodyShort, Button, Heading, List } from '@navikt/ds-react'
import { TerminalIcon } from '@navikt/aksel-icons'

import { isDemo, isDevGcp, isLocal } from '@lib/env'
import { getAbsoluteURL, pathWithBasePath } from '@lib/url'
import { MockLaunchType } from '@navikt/fhir-mock-server/types'
import SessionIdInfo from '@components/help/SessionIdInfo'

export function NoPractitionerSession(): ReactElement {
    return (
        <PageBlock as="main" width="xl" gutters className="pt-4">
            <div className="max-w-prose">
                <Heading size="large" spacing>
                    Du har blitt logget ut
                </Heading>
                <BodyShort spacing>Du har blitt logget ut av sykmeldingsløsningen for denne pasienten.</BodyShort>
                <BodyShort spacing>
                    Du kan prøve å laste siden på nytt, dersom dette ikke fungerer, må du må gjenåpne applikasjonen fra
                    ditt journalsystem.
                </BodyShort>
                <div className="flex gap-3 justify-end mt-8">
                    <Button type="button" variant="secondary-neutral" onClick={() => window.location.reload()}>
                        Last siden på nytt
                    </Button>
                    {(isLocal || isDemo) && (
                        <Button
                            type="button"
                            as="a"
                            variant="secondary-neutral"
                            href={pathWithBasePath(
                                `/fhir/launch?iss=${`${getAbsoluteURL()}/api/mocks/fhir&launch=${`local-dev-launch:Espen Eksempel` satisfies MockLaunchType}`}`,
                            )}
                        >
                            Relaunch dev FHIR (Espen)
                        </Button>
                    )}
                </div>
            </div>
        </PageBlock>
    )
}

export function NoValidPatient(): ReactElement {
    return (
        <PageBlock as="main" width="xl" gutters className="pt-4">
            <div className="max-w-prose">
                <Heading size="large" spacing>
                    Fant ingen (gyldig) pasient
                </Heading>
                <BodyShort spacing>
                    Dette tyder på at pasienten ikke finnes i, eller at pasienten ikke har en gyldig norsk identifikator
                    i ditt journalsystem (FNR eller DNR).
                </BodyShort>
            </div>
            {(isDevGcp || true) && (
                <div className="max-w-prose mt-8 bg-bg-default p-4 rounded-xl">
                    <Heading level="3" size="small" spacing className="flex flex-row gap-3 items-center -mt-1">
                        <TerminalIcon aria-hidden />
                        Teknisk debug for dev-gcp
                    </Heading>
                    <BodyShort spacing>
                        Dette betyr at FHIR API-et klarte ikke å gi oss en gyldig pasient. Mest sannsynligvis en intern
                        feil hos EPJ, eventuelt ugyldig struktur (mindre sannsynlig).
                    </BodyShort>
                    <BodyShort spacing>
                        For å se nøyaktig hva som gikk galt, kan du enten sjekke loggene eller OTEL-tracing. Lenkene
                        under må <span className="font-bold">KOPIERES</span> og åpnes på din faktiske maskin, det er
                        ikke vits å åpne den i WinVerify1.
                    </BodyShort>
                    <List>
                        <List.Item>
                            <span>Logger: </span>
                            <a href="https://grafana.nav.cloud.nais.io/goto/QYbT-ZSvg?orgId=1">Kopier meg</a>
                            <span> (syk-inn dashboard i dev)</span>
                        </List.Item>
                        <List.Item>
                            <span>Traces: </span>
                            <a href="https://grafana.nav.cloud.nais.io/goto/GcvoaZSDg?orgId=1">Kopier meg</a>
                            <span> (error traces de siste 60 minuttene)</span>
                        </List.Item>
                    </List>
                    <SessionIdInfo>
                        <BodyShort>(Mest sannsynligvis ikke relevant for denne feilen)</BodyShort>
                    </SessionIdInfo>
                </div>
            )}
        </PageBlock>
    )
}
