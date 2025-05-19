import React, { ReactElement } from 'react'
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
                <>
                    <PeriodePicker index={index} key={`periode-${periode.id}`} />
                    <AktivitetPicker index={index} key={`aktivitet-${periode.id}`} />
                    {index > 0 && (
                        <Button variant="danger" type="button" onClick={() => remove(index)}>
                            Slett periode
                        </Button>
                    )}
                </>
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
