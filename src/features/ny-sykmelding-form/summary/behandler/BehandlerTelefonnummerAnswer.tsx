import React, { ReactElement, RefObject, useImperativeHandle, useRef, useState } from 'react'
import { Button, FormSummary, TextField } from '@navikt/ds-react'
import { useForm } from 'react-hook-form'
import { CheckmarkHeavyIcon } from '@navikt/aksel-icons'

import { useAppDispatch, useAppSelector } from '@core/redux/hooks'
import { nySykmeldingActions } from '@core/redux/reducers/ny-sykmelding'
import { useMode } from '@core/providers/Modes'

type Props = {
    contextTelefonnummer: string | undefined | null
}

function BehandlerTelefonnummerAnswer({ contextTelefonnummer }: Props): ReactElement {
    const mode = useMode()
    const endreRef = useRef<HTMLButtonElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const manualTelefonnummer = useAppSelector((state) => state.nySykmelding.behandler?.legekontorTlf ?? null)
    const [override, setOverride] = useState(contextTelefonnummer == null && manualTelefonnummer == null)

    if (override) {
        return (
            <ManualTelefonnummerForm
                ref={inputRef}
                defaultValue={manualTelefonnummer}
                onSelect={() => {
                    setOverride(false)
                    requestAnimationFrame(() => {
                        endreRef.current?.focus()
                    })
                }}
            />
        )
    }

    return (
        <FormSummary.Answer className="relative">
            <FormSummary.Label>Telefonnummer legekontor</FormSummary.Label>
            {manualTelefonnummer ? (
                <FormSummary.Value>
                    {manualTelefonnummer} <span className="italic">(manuelt)</span>
                </FormSummary.Value>
            ) : (
                <FormSummary.Value>{contextTelefonnummer}</FormSummary.Value>
            )}
            {mode.type !== 'FHIR' && (
                <Button
                    data-color="neutral"
                    ref={endreRef}
                    variant="secondary"
                    size="xsmall"
                    className="top-0 right-2 absolute"
                    onClick={() => {
                        setOverride(true)
                        requestAnimationFrame(() => {
                            inputRef.current?.focus()
                        })
                    }}
                >
                    Endre
                </Button>
            )}
        </FormSummary.Answer>
    )
}

function ManualTelefonnummerForm({
    ref,
    defaultValue,
    onSelect,
}: {
    ref: RefObject<HTMLInputElement | null>
    defaultValue: string | null
    onSelect: () => void
}): ReactElement {
    const dispatch = useAppDispatch()
    const form = useForm<{ telefonnummer: string }>({
        mode: 'onBlur',
        defaultValues: {
            telefonnummer: defaultValue ?? '',
        },
    })

    const handleFormSubmit = (values: { telefonnummer: string }): void => {
        dispatch(nySykmeldingActions.overrideBehandlerLegekontorTlf(values.telefonnummer))
        onSelect()
    }

    const { ref: fieldRef, ...registeredField } = form.register('telefonnummer', {
        required: 'Telefonnummer er påkrevd',
        minLength: {
            value: 8,
            message: 'Telefonnummer må være minst 8 tegn',
        },
    })

    useImperativeHandle(fieldRef, () => ref.current)

    return (
        <FormSummary.Answer>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="flex items-top gap-2">
                <TextField
                    ref={ref}
                    {...registeredField}
                    label="Telefonnummer legekontor"
                    error={form.formState.errors.telefonnummer?.message}
                    className="grow"
                ></TextField>
                <Button
                    data-color="neutral"
                    className="h-fit mt-8"
                    icon={<CheckmarkHeavyIcon title="Bruk telefonnummer" />}
                    type="submit"
                    variant="secondary"
                />
            </form>
        </FormSummary.Answer>
    )
}

export default BehandlerTelefonnummerAnswer
