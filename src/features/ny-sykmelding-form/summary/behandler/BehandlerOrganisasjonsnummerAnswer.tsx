import React, { ReactElement, RefObject, useImperativeHandle, useRef, useState } from 'react'
import { BodyShort, Button, FormSummary, TextField } from '@navikt/ds-react'
import { useForm } from 'react-hook-form'
import { CheckmarkHeavyIcon } from '@navikt/aksel-icons'

import { useAppDispatch, useAppSelector } from '@core/redux/hooks'
import { nySykmeldingActions } from '@core/redux/reducers/ny-sykmelding'
import { useMode } from '@core/providers/Modes'
import { DetailedAlert } from '@components/help/GeneralErrors'

type Props = {
    contextOrganisasjonsnummer: string | undefined | null
}

function BehandlerOrganisasjonsnummerAnswer({ contextOrganisasjonsnummer }: Props): ReactElement {
    const mode = useMode()
    const endreRef = useRef<HTMLButtonElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const manualOrgnummer = useAppSelector((state) => state.nySykmelding.behandler?.organisasjonsnummer ?? null)
    const [override, setOverride] = useState(contextOrganisasjonsnummer == null && manualOrgnummer == null)

    if (override) {
        return (
            <ManualOrganisasjonsnummerForm
                ref={inputRef}
                defaultValue={manualOrgnummer}
                onSelect={() => {
                    setOverride(false)
                    requestAnimationFrame(() => {
                        endreRef.current?.focus()
                    })
                }}
            />
        )
    }

    const hasValidOrgNummer = /^[0-9]{9}$/.test(contextOrganisasjonsnummer ?? '')

    return (
        <FormSummary.Answer className="relative">
            <FormSummary.Label>Organisasjonsnummer</FormSummary.Label>
            {manualOrgnummer ? (
                <FormSummary.Value>
                    {manualOrgnummer} <span className="italic">(manuelt)</span>
                </FormSummary.Value>
            ) : hasValidOrgNummer ? (
                <FormSummary.Value>{contextOrganisasjonsnummer}</FormSummary.Value>
            ) : (
                <DetailedAlert
                    title="Ugyldig organisasjonsnummer"
                    level="warning"
                    size="small"
                    className="mt-2"
                    noCallToAction
                    noSessionId
                >
                    <BodyShort spacing>
                        Organisasjonsnummeret vi fant på deg ({contextOrganisasjonsnummer}) ser ikke ut til å være et
                        gyldig organisasjonsnummer.
                    </BodyShort>
                    <BodyShort>
                        Du bør derfor endre det for å unngå problemer med innsending av sykmeldingen. Dette må endres i
                        ditt EPJ-system.
                    </BodyShort>
                </DetailedAlert>
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

function ManualOrganisasjonsnummerForm({
    ref,
    defaultValue,
    onSelect,
}: {
    ref: RefObject<HTMLInputElement | null>
    defaultValue: string | null
    onSelect: () => void
}): ReactElement {
    const dispatch = useAppDispatch()
    const form = useForm<{ orgnummer: string }>({
        mode: 'onBlur',
        defaultValues: {
            orgnummer: defaultValue ?? '',
        },
    })

    const handleFormSubmit = (values: { orgnummer: string }): void => {
        dispatch(nySykmeldingActions.overrideBehandlerOrganisasjonsnummmer(values.orgnummer))
        onSelect()
    }

    const { ref: fieldRef, ...registeredField } = form.register('orgnummer', {
        required: 'Organisasjonsnummer er påkrevd',
        minLength: { value: 9, message: 'Organisasjonsnummer må være 9 siffer' },
        maxLength: { value: 9, message: 'Organisasjonsnummer må være 9 siffer' },
        pattern: {
            value: /^[0-9]{9}$/,
            message: 'Organisasjonsnummer kan kun inneholde tall',
        },
    })

    useImperativeHandle(fieldRef, () => ref.current)

    return (
        <FormSummary.Answer>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="flex items-top gap-2">
                <TextField
                    ref={ref}
                    {...registeredField}
                    label="Organisasjonsnummer"
                    error={form.formState.errors.orgnummer?.message}
                    className="grow"
                ></TextField>
                <Button
                    data-color="neutral"
                    className="h-fit mt-8"
                    icon={<CheckmarkHeavyIcon title="Bruk organisasjonsnummer" />}
                    type="submit"
                    variant="secondary"
                />
            </form>
        </FormSummary.Answer>
    )
}

export default BehandlerOrganisasjonsnummerAnswer
