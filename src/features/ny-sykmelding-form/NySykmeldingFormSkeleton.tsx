import React, { ReactElement } from 'react'
import { Skeleton } from '@navikt/ds-react'

import FormSheet from '@components/form/form-section/FormSheet'

import styles from './NySykmeldingForm.module.css'

function NySykmeldingFormSkeleton(): ReactElement {
    return (
        <form className={styles.formGrid}>
            <FormSheet className="relative">
                <Skeleton className="w-full" height={600} variant="rounded" />
                <div className="bg-surface-subtle w-4 h-[calc(100%-2rem)] absolute -right-6 rounded hidden lg:block" />
            </FormSheet>
            <FormSheet>
                <Skeleton className="w-full" height={600} variant="rounded" />
            </FormSheet>
        </form>
    )
}

export default NySykmeldingFormSkeleton
