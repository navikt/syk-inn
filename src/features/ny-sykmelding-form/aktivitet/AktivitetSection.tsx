import React, { ReactElement } from 'react'
import { Button, ErrorMessage } from '@navikt/ds-react'
import { addDays } from 'date-fns'
import { TrashIcon } from '@navikt/aksel-icons'

import { dateOnly } from '@lib/date'
import FormSection from '@components/form/form-section/FormSection'

import { AktivitetsPeriode, useFieldArray, useFormContext } from '../form/types'
import { defaultPeriode } from '../form/default-values'

import AktivitetPicker from './AktivitetPicker'
import PeriodePicker from './PeriodePicker'

type Props = {
    /**
     * For example when sykmelding is based on a previous sykmelding, this is the initial fom date.
     */
    initialFom: string | null
}

function AktivitetSection({ initialFom }: Props): ReactElement {
    const { getValues, formState } = useFormContext()
    const { fields, append, remove } = useFieldArray({
        name: 'perioder' as const,
        rules: {
            required: 'Du må ha minst én periode',
            minLength: { value: 1, message: 'Du må ha minst én periode' },
        },
    })

    return (
        <>
            {fields.map((periode, index) => (
                <FormSection title="Periode" key={periode.id}>
                    <div className="relative mb-4">
                        <PeriodePicker index={index} initialFom={index === 0 ? initialFom : null} />
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
            {formState.errors.perioder?.root?.message && (
                <ErrorMessage>{formState.errors.perioder.root.message}</ErrorMessage>
            )}
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
                            ...defaultPeriode(),
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
