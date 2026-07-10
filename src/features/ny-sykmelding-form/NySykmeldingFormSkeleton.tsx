import { Skeleton } from '@navikt/ds-react'
import React, { ReactElement } from 'react'

import { FormSheet } from '#components/form/form-section/FormSheet'
import { LoadablePageHeader } from '#components/layout/Page'
import { TwoPaneGrid } from '#components/layout/TwoPaneGrid'

import { NySykmeldingPageSteps } from './NySykmeldingPageSteps'

type Props = {
    lead: string
}

export function NySykmeldingFormSkeleton({ lead }: Props): ReactElement {
    return (
        <NySykmeldingPageSteps heading={<LoadablePageHeader lead={lead} value={null} />}>
            <TwoPaneGrid tag="div">
                <FormSheet className="relative">
                    <Skeleton className="w-full" height={600} variant="rounded" />
                    <div className="bg-ax-bg-neutral-soft w-4 h-[calc(100%-2rem)] absolute -right-6 rounded hidden ax-lg:block" />
                </FormSheet>
                <FormSheet>
                    <Skeleton className="w-full" height={600} variant="rounded" />
                </FormSheet>
            </TwoPaneGrid>
        </NySykmeldingPageSteps>
    )
}
