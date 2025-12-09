'use client'

import React, { ReactElement, useRef, useState } from 'react'
import { BodyShort, Button, Chips, ErrorMessage, Label, LocalAlert, Modal, Textarea } from '@navikt/ds-react'
import { Controller, useForm } from 'react-hook-form'
import { logger } from '@navikt/next-logger'

import { pathWithBasePath } from '@lib/url'
import { useMode } from '@core/providers/Modes'
import SessionIdInfo from '@components/help/SessionIdInfo'
import { spanBrowserAsync } from '@lib/otel/browser'

type TilbakemeldingForm = {
    type: 'FEIL' | 'FORSLAG' | 'ANNET'
    message: string
}

function PilotFeedback(): ReactElement {
    const mode = useMode()
    const modalRef = useRef<HTMLDialogElement>(null)
    const { handleSubmit, register, formState, control, setError, reset, clearErrors } = useForm<TilbakemeldingForm>({
        defaultValues: { type: 'FEIL', message: '' },
    })

    const [loading, setLoading] = useState(false)
    const [submitOk, setSubmitOk] = useState<boolean | null>(null)

    const onSubmit = async (values: TilbakemeldingForm): Promise<void> => {
        setLoading(true)
        try {
            await spanBrowserAsync('PilotFeedback.onSubmit', async () => {
                const response = await fetch(pathWithBasePath(mode.paths.feedback), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(values),
                })

                if (response.ok) {
                    setSubmitOk(true)
                    setLoading(false)
                    reset()
                    clearErrors()
                }

                const data = await response.json()
                setError('root', { message: data.message })
            })
        } catch (e) {
            logger.error(e)
            setError('root', { message: 'Ukjent systemfeil' })
        } finally {
            setLoading(false)
        }
    }

    const handleClose = (): void => {
        modalRef.current?.close()
        clearErrors()
        setSubmitOk(null)
    }

    return (
        <div className="fixed -bottom-1 right-32 w-fit">
            <Button
                variant="secondary-neutral"
                size="small"
                className="bg-white"
                onClick={() => modalRef.current?.showModal()}
            >
                Tilbakemelding
            </Button>
            <Modal
                ref={modalRef}
                header={{ heading: 'Tilbakemelding for pilotbrukere' }}
                width={650}
                onClose={handleClose}
            >
                <Modal.Body>
                    <BodyShort spacing size="small" className="italic">
                        Denne tilbakemeldingen vil bli automatisk sendt til #ext-sykmelding-pilot på Slack. Dersom du
                        vil utdype mer i ettertid kan du skrive videre i tråden på Slack etter du har sendt
                        tilbakemeldingen.
                    </BodyShort>
                    {!submitOk ? (
                        <form onSubmit={handleSubmit(onSubmit)} id="pilot-feedback-form" method="dialog">
                            <Controller
                                control={control}
                                name="type"
                                rules={{ required: 'Du må velge en tilbakemeldingstype' }}
                                render={({ field, fieldState }) => (
                                    <fieldset className="p-0">
                                        <Label htmlFor="feedback-type-chips">Hva vil du dele?</Label>
                                        <Chips id="feedback-type-chips" className="mt-1">
                                            <Chips.Toggle
                                                checkmark={false}
                                                selected={field.value === 'FEIL'}
                                                onClick={() => field.onChange('FEIL')}
                                                onBlur={field.onBlur}
                                                type="button"
                                            >
                                                Feil
                                            </Chips.Toggle>
                                            <Chips.Toggle
                                                checkmark={false}
                                                selected={field.value === 'FORSLAG'}
                                                onClick={() => field.onChange('FORSLAG')}
                                                onBlur={field.onBlur}
                                                type="button"
                                            >
                                                Forslag
                                            </Chips.Toggle>
                                            <Chips.Toggle
                                                checkmark={false}
                                                selected={field.value === 'ANNET'}
                                                onClick={() => field.onChange('ANNET')}
                                                onBlur={field.onBlur}
                                                type="button"
                                            >
                                                Noe annet
                                            </Chips.Toggle>
                                        </Chips>
                                        {fieldState.error?.message && (
                                            <ErrorMessage>{fieldState.error?.message}</ErrorMessage>
                                        )}
                                    </fieldset>
                                )}
                            ></Controller>
                            <Textarea
                                {...register('message', { required: 'Husk å skriv en tilbakemelding!' })}
                                className="mt-4"
                                error={formState.errors.message?.message}
                                label="Tilbakemelding"
                                description="Husk å aldri dele noe personinformasjon i dette feltet!"
                            />
                            {formState.errors?.root?.message && (
                                <LocalAlert status="error" className="mt-4">
                                    <LocalAlert.Header>
                                        <LocalAlert.Title>Kunne ikke motta tilbakemelding</LocalAlert.Title>
                                    </LocalAlert.Header>
                                    <LocalAlert.Content>
                                        <BodyShort spacing>
                                            Dette er forhåpentligvis en midlertidig feil. Du kan prøve å sende inn på
                                            nytt. Dersom problemet vedvarer kan du kontakte oss direkte på Slack.
                                        </BodyShort>
                                        <BodyShort>Feilen er: {formState.errors.root.message}</BodyShort>
                                        <SessionIdInfo />
                                    </LocalAlert.Content>
                                </LocalAlert>
                            )}
                        </form>
                    ) : (
                        <LocalAlert status="success">
                            <LocalAlert.Header>
                                <LocalAlert.Title>Tilbakemeldingen er sendt</LocalAlert.Title>
                            </LocalAlert.Header>
                            <LocalAlert.Content>
                                <BodyShort spacing>Takk for at du sendte inn tilbakemelding!</BodyShort>
                                <BodyShort>Du kan følge opp i Slack om du ønsker det.</BodyShort>
                            </LocalAlert.Content>
                        </LocalAlert>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    {!submitOk ? (
                        <>
                            <Button form="pilot-feedback-form" type="submit" loading={loading} disabled={loading}>
                                Send
                            </Button>
                            <Button type="button" variant="secondary" onClick={handleClose}>
                                Avbryt
                            </Button>
                        </>
                    ) : (
                        <Button type="button" variant="secondary-neutral" onClick={handleClose}>
                            Lukk
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default PilotFeedback
