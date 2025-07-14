import React, { ReactElement } from 'react'

import { useFlag } from '@toggles/context'

import ArbeidsforholdPicker from './ArbeidsforholdPicker'
import { AaregArbeidsforholdPicker } from './AaregArbeidsforholdPicker'

function ArbeidsforholdSection(): ReactElement {
    const useAaregFlag = useFlag('SYK_INN_AAREG')

    if (!useAaregFlag.enabled) {
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
