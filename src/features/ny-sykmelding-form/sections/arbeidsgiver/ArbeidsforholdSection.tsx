import React, { ReactElement } from 'react'

import { useFlag } from '#core/toggles/context'

import { AaregArbeidsforholdPicker } from './AaregArbeidsforholdPicker'
import ArbeidsforholdPicker from './ArbeidsforholdPicker'

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
