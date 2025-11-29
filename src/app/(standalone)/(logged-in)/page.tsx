import React, { ReactElement } from 'react'

import { PageLayout, StaticPageHeading } from '@components/layout/Page'
import ManualPatientPicker from '@features/helseid/manual-patient-picker/ManualPatientPicker'

function Page(): ReactElement {
    return (
        <PageLayout heading={<StaticPageHeading>Velg pasient</StaticPageHeading>} bg="transparent" size="fit">
            <ManualPatientPicker />
        </PageLayout>
    )
}

export default Page
