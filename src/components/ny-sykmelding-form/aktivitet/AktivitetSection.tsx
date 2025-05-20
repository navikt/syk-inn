import React, { Fragment, ReactElement } from 'react'
import { useFieldArray } from 'react-hook-form'
import { Button } from '@navikt/ds-react'

import { getDefaultPeriode } from '@components/ny-sykmelding-form/MainSection'
import { NySykmeldingMainFormValues } from '@components/ny-sykmelding-form/form'

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
                        <Button variant="danger" type="button" onClick={() => remove(index)}>
                            Slett periode
                        </Button>
                    )}
                </Fragment>
            ))}
            <Button
                variant="secondary"
                type="button"
                onClick={() => {
                    append(getDefaultPeriode())
                }}
            >
                Legg til ny periode
            </Button>
        </>
    )
}

export default AktivitetSection
