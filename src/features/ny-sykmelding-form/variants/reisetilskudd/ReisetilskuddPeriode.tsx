import React, { ReactElement } from 'react'

import PeriodePicker from '#features/ny-sykmelding-form/sections/aktivitet/PeriodePicker'

type Props = {
    initialFom: string | null
}

export function ReisetilskuddPeriode({ initialFom }: Props): ReactElement {
    return (
        <div className="mb-2">
            <PeriodePicker index={0} isLast={false} initialFom={initialFom} />
        </div>
    )
}
