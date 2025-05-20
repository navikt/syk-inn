import React, { ReactElement } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { isBefore, subDays } from 'date-fns'
import * as R from 'remeda'

import ExpandableFormSection from '@components/form/expandable-form-section/ExpandableFormSection'

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
                    <ExpandableFormSection title="Tilbakedatering">
                        <TilbakedateringSection />
                    </ExpandableFormSection>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

// TODO skriv test for business
export function isTilbakedatering(perioder: Pick<AktivitetsPeriode, 'periode'>[], sykmeldingsDato: Date): boolean {
    const firstPeriode = R.firstBy(perioder, (periode) => periode.periode.fom)
    return firstPeriode ? isBefore(new Date(firstPeriode?.periode.fom), subDays(sykmeldingsDato, 8)) : false
}

export default DynamicTilbakedateringSection
