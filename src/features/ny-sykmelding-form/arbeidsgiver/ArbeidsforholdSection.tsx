import React, { ReactElement } from 'react'

import { useFlag } from '@core/toggles/context'

import ArbeidsforholdPicker from './ArbeidsforholdPicker'
import { AaregArbeidsforholdPicker } from './AaregArbeidsforholdPicker'

function ArbeidsforholdSection(): ReactElement {
    const aaregEnabled = useFlag('SYK_INN_AAREG')

    if (!aaregEnabled) {
        return (
            <div>
                <ArbeidsforholdPicker />
            </div>
        )
    }

    return (
        <div>
            <AaregArbeidsforholdPicker />
        </div>
    )
}

export default ArbeidsforholdSection
