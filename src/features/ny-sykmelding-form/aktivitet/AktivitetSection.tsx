import React, { Fragment, ReactElement } from 'react'
import { Button } from '@navikt/ds-react'
import { addDays } from 'date-fns'
import { TrashIcon } from '@navikt/aksel-icons'

import { dateOnly } from '@lib/date'
import FormSection from '@components/form/form-section/FormSection'

import { AktivitetsPeriode, useFieldArray, useFormContext } from '../form'
import { getDefaultPeriode } from '../form-default-values'

import AktivitetPicker from './AktivitetPicker'
import PeriodePicker from './PeriodePicker'

function AktivitetSection(): ReactElement {
    const { getValues } = useFormContext()
    const { fields, append, remove } = useFieldArray({
        name: 'perioder' as const,
    })

    return (
        <>
            {fields.map((periode, index) => (
                <FormSection title="Periode" key={periode.id}>
                    <div className="relative mb-4">
                        <PeriodePicker index={index} />
                        <AktivitetPicker index={index} />

                        {index > 0 && (
                            <Button
                                className="absolute top-8 right-4"
                                variant="danger"
                                type="button"
                                size="small"
                                icon={<TrashIcon title="Slett periode" />}
                                onClick={() => remove(index)}
                            />
                        )}
                    </div>
                </FormSection>
            ))}
            <div className="mt-2 mb-2">
                <Button
                    variant="secondary"
                    type="button"
                    size="small"
                    onClick={() => {
                        const periods = getValues('perioder')
                        const lastPeriode = periods[periods.length - 1]

                        /**
                         * Fom should be N+1 previous period's tom.
                         */
                        const nyPeriode: AktivitetsPeriode = {
                            ...getDefaultPeriode(),
                            periode: {
                                fom: lastPeriode.periode.tom ? dateOnly(addDays(lastPeriode.periode.tom, 1)) : null,
                                tom: null,
                            },
                        }

                        append(nyPeriode, { shouldFocus: false })
                    }}
                >
                    Legg til ny periode
                </Button>
            </div>
        </>
    )
}

export default AktivitetSection
