import React, { ReactElement, useRef } from 'react'
import { Button } from '@navikt/ds-react'
import { TrashIcon } from '@navikt/aksel-icons'

import { cn } from '@utils/tw'
import { useFieldArray } from '@components/ny-sykmelding-form/form'

import BidiagnosePicker from './BidiagnosePicker'

function BidiagnoseSection(): ReactElement {
    const addNewRef = useRef<HTMLButtonElement>(null)
    const { fields, append, remove } = useFieldArray({
        name: 'diagnoser.bidiagnoser' as const,
    })

    return (
        <section aria-label="Bidiagnoser">
            {fields.map((field, index) => (
                <div key={field.id} className={cn('relative my-4')}>
                    <BidiagnosePicker
                        index={index}
                        onSelect={() => requestAnimationFrame(() => addNewRef.current?.focus())}
                    >
                        <Button
                            variant="danger"
                            type="button"
                            size="small"
                            icon={<TrashIcon title="Slett bidiagnose" />}
                            onClick={() => {
                                remove(index)
                                requestAnimationFrame(() => addNewRef.current?.focus())
                            }}
                        />
                    </BidiagnosePicker>
                </div>
            ))}

            <div className="mt-4">
                <Button
                    ref={addNewRef}
                    type="button"
                    variant="secondary"
                    size="small"
                    onClick={() => {
                        append(null)
                    }}
                >
                    Legg til bidiagnose
                </Button>
            </div>
        </section>
    )
}

export default BidiagnoseSection
