'use client'

import React, { ReactElement } from 'react'
import { BodyLong, Modal, Link as AkselLink, Skeleton, Heading } from '@navikt/ds-react'
import { TestFlaskIcon } from '@navikt/aksel-icons'

import { ComboTableSkeleton } from '@features/fhir/dashboard/ComboTableCard'
import DashboardCard from '@features/fhir/dashboard/card/DashboardCard'
import { PageLayout } from '@components/layout/Page'

function NonPilotUserWarning(): ReactElement | null {
    return (
        <PageLayout
            heading={
                <Heading level="2" size="medium" spacing className="flex gap-2">
                    <Skeleton width={240} />
                </Heading>
            }
            size="full"
            bg="transparent"
        >
            <div className="grid grid-cols-2 gap-3 w-full">
                <DashboardCard className="col-span-2 flex gap-8" ariaLabel="">
                    <Skeleton variant="rounded" height={254} width={526} />
                    <Skeleton variant="rounded" height={254} className="grow" />
                </DashboardCard>
                <DashboardCard className="col-span-2" ariaLabel="">
                    <ComboTableSkeleton />
                </DashboardCard>
            </div>
            <Modal
                open={true}
                onClose={() => void 0}
                onKeyDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                }}
                closeOnBackdropClick={false}
                header={{
                    icon: <TestFlaskIcon aria-hidden />,
                    heading: 'Ny sykmelding – Pilot',
                    closeButton: false,
                    label: 'Du har ikke tilgang til denne løsningen',
                }}
                width="medium"
            >
                <Modal.Body>
                    <BodyLong spacing>
                        Nav utvikler en ny løsning for digitale sykmeldinger, og vi har startet en pilot med et utvalg
                        leger. Foreløpig er det kun disse som har tilgang til applikasjonen.
                    </BodyLong>

                    <BodyLong>
                        Vi planlegger å utvide piloten etter hvert. Dersom du ønsker å bidra med testing og gi innspill
                        til den nye løsningen, er du velkommen til å sende en e-post til
                        <AkselLink href="mailto:erik.haug@nav.no">erik.haug@nav.no</AkselLink>.
                    </BodyLong>
                </Modal.Body>
            </Modal>
        </PageLayout>
    )
}

export default NonPilotUserWarning
