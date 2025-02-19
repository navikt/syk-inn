import React, { ReactElement } from 'react'
import { BodyLong, Heading } from '@navikt/ds-react'
import { List, ListItem } from '@navikt/ds-react/List'
import Link from 'next/link'
import { PageBlock } from '@navikt/ds-react/Page'

import { isLocalOrDemo } from '@utils/env'
import { saveSessionCompleted } from '@fhir/sessions/session-lifecycle'
import FhirDataProvider from '@fhir/components/FhirDataProvider'
import NySykmeldingForm from '@components/ny-sykmelding-form/NySykmeldingForm'
import TidligereSykmeldingerTimeline from '@components/tidligere-sykmeldinger/TidligereSykmeldingerTimeline'

import { getFlag, getToggles } from '../../../toggles/unleash'

type Props = {
    searchParams: Promise<{ code: string | undefined }>
}

async function Page(props: Props): Promise<ReactElement> {
    const searchParams = await props.searchParams
    if (searchParams.code) {
        /**
         * Server component:
         *
         * Similar to /launch/page.tsx, the ?code=<code> parameter is only available at server component rendering time
         * when the user is returned here after authenticating with the FHIR server. The fhirclient-library will remove
         * the code from the URL client side.
         */
        await saveSessionCompleted()
    }

    const tidligereSykmeldingerToggle = getFlag('SYK_INN_TIDLIGERE_SYKMELDINGER', await getToggles())

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
            <FhirDataProvider>
                {tidligereSykmeldingerToggle.enabled && <TidligereSykmeldingerTimeline />}
                <NySykmeldingForm />
            </FhirDataProvider>
        </PageBlock>
    )
}

export default Page
