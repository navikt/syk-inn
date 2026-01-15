import React, { ReactElement } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { HelpText, Link } from '@navikt/ds-react'

import FormSection from '@components/form/form-section/FormSection'

import { useFormContext } from '../form/types'

import { isTilbakedatering } from './tilbakedatering-utils'
import TilbakedateringSection from './TilbakedateringSection'

function DynamicTilbakedateringSection(): ReactElement | null {
    const { watch } = useFormContext()
    const perioder = watch('perioder')
    const tilbakedatering = isTilbakedatering(perioder, new Date())

    return (
        <AnimatePresence initial={false}>
            {tilbakedatering && (
                <motion.div
                    className="overflow-hidden ax-lg:col-span-2 p-1"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                    <FormSection
                        title="Tilbakedatering"
                        helpText={
                            <HelpText>
                                Hva menes med{' '}
                                <Link
                                    href="https://www.nav.no/samarbeidspartner/om-sykmeldingen#tilbakedatering"
                                    target="_blank"
                                >
                                    tilbakedatering
                                </Link>
                            </HelpText>
                        }
                    >
                        <TilbakedateringSection />
                    </FormSection>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default DynamicTilbakedateringSection
