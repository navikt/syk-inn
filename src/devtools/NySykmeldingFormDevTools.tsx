import React, { ReactElement, useEffect, useRef } from 'react'
import { DevTool } from '@hookform/devtools'
import { logger } from '@navikt/next-logger'
import { addDays, subDays } from 'date-fns'

import { useFormContext } from '@components/ny-sykmelding-form/form'
import { dateOnly } from '@utils/date'

function NySykmeldingFormDevTools(): ReactElement {
    const { control, setValue } = useFormContext()

    useSecretShortcut(['d', 'd', 'd'], () => {
        setValue('andreSporsmal', { svangerskapsrelatert: true, yrkesskade: null })
        setValue('arbeidsforhold.harFlereArbeidsforhold', 'NEI')
        setValue('perioder', [
            {
                periode: { fom: dateOnly(new Date()), tom: dateOnly(addDays(new Date(), 7)) },
                aktivitet: { type: 'AKTIVITET_IKKE_MULIG', grad: null },
            },
        ])
    })

    useSecretShortcut(['d', 'd', 't'], () => {
        setValue('perioder', [
            {
                periode: { fom: dateOnly(subDays(new Date(), 10)), tom: dateOnly(subDays(new Date(), 2)) },
                aktivitet: { type: 'AKTIVITET_IKKE_MULIG', grad: null },
            },
        ])
    })

    return (
        <div>
            <DevTool control={control} placement="top-left" />
        </div>
    )
}

function useSecretShortcut(combo: string[], onHappen: () => void): void {
    const pressed = useRef<string[]>([])
    const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        const onKey = (e: KeyboardEvent): void => {
            pressed.current.push(e.key)
            if (pressed.current.length > combo.length) pressed.current.shift()
            if (JSON.stringify(pressed.current) === JSON.stringify(combo)) {
                logger.info(`Secret combo  pressed: ${JSON.stringify(combo)}!`)
                onHappen()
            }

            if (timeout.current) clearTimeout(timeout.current)
            timeout.current = setTimeout(() => {
                pressed.current = []
            }, 200)
        }

        window.addEventListener('keydown', onKey)

        return () => window.removeEventListener('keydown', onKey)
    }, [combo, onHappen])
}

export default NySykmeldingFormDevTools
