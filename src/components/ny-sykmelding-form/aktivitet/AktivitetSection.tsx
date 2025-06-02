import React, { Fragment, ReactElement } from 'react'
import { useFieldArray } from 'react-hook-form'
import { Button } from '@navikt/ds-react'

import { NySykmeldingMainFormValues } from '@components/ny-sykmelding-form/form'
import { getDefaultPeriode } from '@components/ny-sykmelding-form/form-default-values'

import AktivitetPicker from './AktivitetPicker'
import PeriodePicker from './PeriodePicker'

function AktivitetSection(): ReactElement {
    const { fields, append, remove } = useFieldArray<NySykmeldingMainFormValues>({
        name: 'perioder',
    })
    return (
        <>
            {fields?.map((periode, index) => (
                <Fragment key={periode.id}>
                    <PeriodePicker index={index} />
                    <AktivitetPicker index={index} />
                    {index > 0 && (
                        <Button variant="danger" type="button" size="small" onClick={() => remove(index)}>
                            Slett periode
                        </Button>
                    )}
                </Fragment>
            ))}
            <div className="mt-0">
                <Button
                    variant="secondary"
                    type="button"
                    size="small"
                    onClick={() => {
                        append(getDefaultPeriode())
                    }}
                >
                    Legg til ny periode
                </Button>
            </div>
        </>
    )
}

export default AktivitetSection
