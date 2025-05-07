import React, { ReactElement } from 'react'
import { BodyLong, Heading } from '@navikt/ds-react'
import { List, ListItem } from '@navikt/ds-react/List'
import { PageBlock } from '@navikt/ds-react/Page'
import Link from 'next/link'

import { isLocalOrDemo } from '@utils/env'
import NySykmeldingForm from '@components/ny-sykmelding-form/NySykmeldingForm'
import NySykmeldingFormMultiStep from '@components/ny-sykmelding-form-multi-step/NySykmeldingFormMultiStep'
import TidligereSykmeldingerTimeline from '@components/tidligere-sykmeldinger/TidligereSykmeldingerTimeline'
import { getFlag, getToggles } from '@toggles/unleash'

async function Page(): Promise<ReactElement> {
    const toggles = await getToggles()

    const tidligereSykmeldingerToggle = getFlag('SYK_INN_TIDLIGERE_SYKMELDINGER', toggles)
    const multistepToggle = getFlag('SYK_INN_MULTISTEP_FORM_V1', toggles)

    return (
        <PageBlock as="main" width="xl" gutters className="pt-4">
            {isLocalOrDemo && (
                <div className="mb-2">
                    <Link href="/">← Back to development page</Link>
                </div>
            )}
            {multistepToggle.enabled ? (
                <NySykmeldingFormMultiStep />
            ) : (
                <NormalFhir tidligereSykmeldingerEnabled={tidligereSykmeldingerToggle.enabled} />
            )}
        </PageBlock>
    )
}

function NormalFhir({ tidligereSykmeldingerEnabled }: { tidligereSykmeldingerEnabled: boolean }): ReactElement {
    return (
        <>
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
            {tidligereSykmeldingerEnabled && <TidligereSykmeldingerTimeline />}
            <NySykmeldingForm />
        </>
    )
}

export default Page
