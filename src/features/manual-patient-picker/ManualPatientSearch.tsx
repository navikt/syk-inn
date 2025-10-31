import React, { ReactElement } from 'react'
import { Search } from '@navikt/ds-react'
import { useController, useForm } from 'react-hook-form'

type Props = {
    handleSearch: (ident: string) => void
    defaultIdent: string | undefined
}

function ManualPatientSearch({ handleSearch, defaultIdent }: Props): ReactElement {
    const form = useForm<{ ident: string }>({
        defaultValues: { ident: defaultIdent },
    })
    const controller = useController({
        name: 'ident',
        control: form.control,
        rules: {
            required: 'Du må oppgi et fødselsnummer eller d-nummer',
            pattern: {
                message: 'Fødselsnummer eller d-nummer kan kun inneholde tall',
                value: /^[0-9]+$/,
            },
            minLength: {
                value: 11,
                message: 'Fødselsnummer eller d-nummer må være på 11 siffer',
            },
            maxLength: {
                value: 11,
                message: 'Fødselsnummer eller d-nummer kan ikke være lengre enn 11 siffer',
            },
        },
    })

    return (
        <form onSubmit={form.handleSubmit((data) => handleSearch(data.ident))}>
            <Search
                {...controller.field}
                label="Finn pasient"
                description="Du kan søke på fødselsnummer eller d-nummer"
                variant="secondary"
                hideLabel={false}
                error={controller.fieldState.error?.message}
                onClear={() => {
                    form.reset({ ident: '' })
                }}
            />
        </form>
    )
}

export default ManualPatientSearch
