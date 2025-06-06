import React, { ReactElement } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { isBefore, subDays } from 'date-fns'
import * as R from 'remeda'

import FormSection from '@components/form/form-section/FormSection'

import { AktivitetsPeriode, useFormContext } from '../form'

import TilbakedateringSection from './TilbakedateringSection'

function DynamicTilbakedateringSection(): ReactElement | null {
    const { watch } = useFormContext()
    const perioder = watch('perioder')
    const tilbakedatering = isTilbakedatering(perioder, new Date())

    return (
        <AnimatePresence>
            {tilbakedatering && (
                <motion.div
                    className="overflow-hidden lg:col-span-2"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                    <FormSection title="Tilbakedatering" className="mt-8">
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
        R.map((it) => it.periode.fom),
        R.filter(R.isNonNull),
        R.firstBy(R.identity()),
    )

    // 7 seems weird here, but inclusivity both in isBefore and "fom" means we need to subtract 7 days
    return firstFom ? isBefore(new Date(firstFom), subDays(sykmeldingsDato, 7)) : false
}

export default DynamicTilbakedateringSection
