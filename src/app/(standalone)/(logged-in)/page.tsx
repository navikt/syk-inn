import React, { ReactElement } from 'react'

import { PageLayout, StaticPageHeading } from '@components/layout/Page'
import ManualPatientPicker from '@features/manual-patient-picker/ManualPatientPicker'

function Page(): ReactElement {
    return (
        <PageLayout heading={<StaticPageHeading>Velg pasient</StaticPageHeading>} bg="white" size="fit">
            <ManualPatientPicker />
        </PageLayout>
    )
}

export default Page
