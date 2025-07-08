import React, { ReactElement } from 'react'
import { Button } from '@navikt/ds-react'
import { useFieldArray } from 'react-hook-form'

import BidiagnosePicker from './BidiagnosePicker'

function BidiagnoseSection(): ReactElement {
    const { fields, append, remove } = useFieldArray({
        name: 'diagnoser.bidiagnoser',
    })

    return (
        <>
            {fields.map((field, index) => (
                <div key={field.id} className="relative mb-4">
                    <BidiagnosePicker index={index} />
                    <Button type="button" variant="danger" size="xsmall" onClick={() => remove(index)}>
                        Fjern
                    </Button>
                </div>
            ))}

            <Button
                type="button"
                variant="secondary"
                size="small"
                onClick={() => append(null)} // or append({ code: '', system: '', text: '' }) depending on your model
            >
                Legg til bidiagnose
            </Button>
        </>
    )
}

export default BidiagnoseSection
