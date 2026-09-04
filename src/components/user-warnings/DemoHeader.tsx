import { ExclamationmarkTriangleIcon, ExternalLinkIcon, FaceSmileIcon } from '@navikt/aksel-icons'
import { BodyShort, Button, Link as AkselLink } from '@navikt/ds-react'
import { InfoCard, InfoCardHeader, InfoCardContent, InfoCardTitle } from '@navikt/ds-react/InfoCard'
import React, { ReactElement } from 'react'

import { isLocal, isDemo } from '#lib/env'
import { raise } from '#lib/ts'
import { pathWithBasePath } from '#lib/url'

export async function DemoHeader(): Promise<ReactElement> {
    if (!(isLocal || isDemo)) {
        raise(new Error('DemoHeader should only be rendered in local or demo environment'))
    }

    return (
        <div className="p-4 flex-col sm:flex-row flex items-start justify-center w-full gap-3">
            <InfoCard data-color="warning" size="small">
                <InfoCardHeader icon={<ExclamationmarkTriangleIcon aria-hidden />}>
                    <InfoCardTitle suppressHydrationWarning>Demoside for test</InfoCardTitle>
                </InfoCardHeader>
                <InfoCardContent>
                    <BodyShort>
                        Dette er en demo-applikasjon med falsk data, og skal kun brukes til demo og test.
                    </BodyShort>
                    <AkselLink href={pathWithBasePath('/dev')} className="text-xs">
                        ← Velg andre scenarioer
                    </AkselLink>
                </InfoCardContent>
            </InfoCard>
            <InfoCard data-color="info" size="small">
                <InfoCardHeader icon={<FaceSmileIcon aria-hidden />}>
                    <InfoCardTitle suppressHydrationWarning>Noe du vil dele med oss?</InfoCardTitle>
                </InfoCardHeader>
                <InfoCardContent>
                    <BodyShort spacing>
                        Svar på en enkel spørreundersøkelse og fortell oss dine tanker om løsningen.
                    </BodyShort>
                    <Button
                        size="small"
                        icon={<ExternalLinkIcon aria-hidden />}
                        variant="secondary"
                        as="a"
                        href={process.env.DEMO_MS_FORMS_URL ?? raise(new Error('Missing DEMO_MS_FORMS_URL env var'))}
                        target="_blank"
                    >
                        Svar på spørreundersøkelse
                    </Button>
                </InfoCardContent>
            </InfoCard>
        </div>
    )
}
