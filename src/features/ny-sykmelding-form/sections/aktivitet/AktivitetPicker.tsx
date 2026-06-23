import { BodyShort, HelpText, Label, Link, Select } from '@navikt/ds-react'
import { AnimatePresence } from 'motion/react'
import React, { ReactElement } from 'react'

import { SimpleReveal } from '#components/animation/Reveal'

import { AktiviteFieldType, useController } from '../../form/types'

import ArsakerPicker from './ArsakerPicker'
import GradertGradPicker from './GradertGradPicker'

function AktivitetPicker({ index }: { index: number }): ReactElement {
    const aktivitetField = useController({
        name: `perioder.${index}.aktivitet.type`,
        defaultValue: 'AKTIVITET_IKKE_MULIG' satisfies AktiviteFieldType,
        rules: { required: 'Du må velge en aktivitetstype' },
    })

    return (
        <div className="grid grid-cols-1 ax-md:grid-cols-[30ch_1fr] gap-4 mt-2">
            <Select
                label={
                    <div className="flex gap-1">
                        Mulighet for arbeid{' '}
                        <HelpText title="Les mer om ulike typer sykmelding">
                            Les mer om ulike typer sykmelding på{' '}
                            <Link
                                href="https://www.nav.no/samarbeidspartner/om-sykmeldingen#ulike-typer-sykmelding"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                nav.no
                            </Link>
                        </HelpText>
                    </div>
                }
                className="max-w-sm flex flex-col"
                value={aktivitetField.field.value}
                onChange={(event) => {
                    aktivitetField.field.onChange(event.target.value)
                }}
            >
                <option value={'GRADERT' satisfies AktiviteFieldType}>Kan være delvis i arbeid</option>
                <option value={'AKTIVITET_IKKE_MULIG' satisfies AktiviteFieldType}>Kan ikke være i arbeid</option>
            </Select>
            <AnimatePresence initial={false}>
                {aktivitetField.field.value === 'GRADERT' ? (
                    <GradertGradPicker index={index} />
                ) : (
                    <div className="flex flex-col gap-1">
                        <Label>Sykmeldingsgrad (%)</Label>
                        <BodyShort className="h-12 p-2 pl-0 flex items-center">100%</BodyShort>
                    </div>
                )}
                {aktivitetField.field.value === 'AKTIVITET_IKKE_MULIG' && (
                    <>
                        <SimpleReveal className="col-span-2">
                            <ArsakerPicker index={index} />
                        </SimpleReveal>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}

export default AktivitetPicker
