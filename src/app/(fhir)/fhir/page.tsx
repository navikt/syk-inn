import React, { ReactElement } from 'react'
import { BodyLong, Heading } from '@navikt/ds-react'
import { List, ListItem } from '@navikt/ds-react/List'
import { PageBlock } from '@navikt/ds-react/Page'
import Link from 'next/link'

import { isLocalOrDemo } from '@utils/env'
import NySykmeldingForm from '@components/ny-sykmelding-form/NySykmeldingForm'
import TidligereSykmeldingerTimeline from '@components/tidligere-sykmeldinger/TidligereSykmeldingerTimeline'
import FhirDataProvider from '@fhir/components/FhirDataProvider'
import { serverFhirResources } from '@fhir/fhir-data/fhir-data-server'
import { getFlag, getToggles } from '@toggles/unleash'

async function Page(): Promise<ReactElement> {
    const [behandler, toggles] = await Promise.all([serverFhirResources.getBehandlerInfo(), getToggles()])
    const tidligereSykmeldingerToggle = getFlag('SYK_INN_TIDLIGERE_SYKMELDINGER', toggles)

    return (
        <PageBlock as="main" width="xl" gutters className="pt-4">
            {isLocalOrDemo && (
                <div className="mb-2">
                    <Link href="/">← Back to development page</Link>
                </div>
            )}
            <section className="max-w-prose mb-8">
                <Heading level="2" size="medium" spacing>
                    Opprett ny sykmelding
                </Heading>
                <BodyLong spacing>
                    Her kan du opprette en sykmelding for pasienten. Du vil få hjelp underveis i skjemaet dersom noe
                    mangler, eller om du gjør noe som vil bli avvist etter innsending.
                </BodyLong>
                <List
                    as="ul"
                    title="Krav om sykmeldingen i pilot-fase"
                    description="Nå i pilot-fasen støtter vi kun enkle sykmeldinger, som oppfyller et sett med krav"
                >
                    <ListItem>Det må være en førstegangssykmelding</ListItem>
                    <ListItem>Den sykmeldte må ha kun en hoveddiagnose, ingen bi-diagnoser</ListItem>
                    <ListItem>Det må kun være èn periode, enten 100% eller gradert sykmelding</ListItem>
                </List>
            </section>
            <FhirDataProvider behandler={behandler}>
                {tidligereSykmeldingerToggle.enabled && <TidligereSykmeldingerTimeline />}
                <NySykmeldingForm />
            </FhirDataProvider>
        </PageBlock>
    )
}

export default Page
