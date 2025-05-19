import React, { ReactElement } from 'react'
import { useFormContext } from 'react-hook-form'
import { DevTool } from '@hookform/devtools'

function NySykmeldingFormDevTools(): ReactElement {
    const { control } = useFormContext()

    return (
        <div>
            <DevTool control={control} placement="top-left" />
        </div>
    )
}

export default NySykmeldingFormDevTools
