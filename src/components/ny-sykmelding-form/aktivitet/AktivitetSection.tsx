import React, { ReactElement } from 'react'

import PeriodePicker from './PeriodePicker'
import AktivitetPicker from './AktivitetPicker'

function AktivitetSection(): ReactElement {
    return (
        <>
            <PeriodePicker />
            <AktivitetPicker />
        </>
    )
}

export default AktivitetSection
