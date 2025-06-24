import React, { ReactElement } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { isBefore, parseISO, subDays } from 'date-fns'
import * as R from 'remeda'

import FormSection from '@components/form/form-section/FormSection'

import { AktivitetsPeriode, useFormContext } from '../form'

import TilbakedateringSection from './TilbakedateringSection'

function DynamicTilbakedateringSection(): ReactElement | null {
    const { watch } = useFormContext()
    const perioder = watch('perioder')
    const tilbakedatering = isTilbakedatering(perioder, new Date())

    return (
        <AnimatePresence initial={false}>
            {tilbakedatering && (
                <motion.div
                    className="overflow-hidden lg:col-span-2 p-1"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                    <FormSection title="Tilbakedatering">
                        <TilbakedateringSection />
                    </FormSection>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export function isTilbakedatering(perioder: Pick<AktivitetsPeriode, 'periode'>[], sykmeldingsDato: Date): boolean {
    const firstFom = R.pipe(
        perioder,
        R.map((it) => it.periode?.fom),
        R.filter(R.isNonNull),
        R.firstBy(R.identity()),
    )

    // 4 days is OK, but 5 or more is tilbakedatering and needs begrunnelse, inclusive in both ends.
    return firstFom ? isBefore(parseISO(firstFom), subDays(sykmeldingsDato, 5)) : false
}

export default DynamicTilbakedateringSection
