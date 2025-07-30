import React, { ReactElement } from 'react'
import { BodyShort, Checkbox, Heading } from '@navikt/ds-react'
import { BriefcaseIcon, CalendarIcon, InformationSquareIcon, PillRectangleIcon } from '@navikt/aksel-icons'

import { toReadableDatePeriod } from '@lib/date'
import { SykmeldingFragment } from '@queries'

type SykmeldingProps = { sykmelding: SykmeldingFragment }

function TidligereSykmelding({ sykmelding }: SykmeldingProps): ReactElement {
    return (
        <div className="max-w-prose">
            <div className="grid grid-cols-1 gap-3">
                <div className="bg-bg-default p-4 rounded-sm">
                    <Heading className="flex gap-1.5 items-center" size="small" level="3" spacing>
                        <BriefcaseIcon aria-hidden />
                        Arbeidsforhold
                    </Heading>
                    <BodyShort>
                        {sykmelding.values.arbeidsgiver?.arbeidsgivernavn ?? 'Ingen arbeidsgiver oppgitt'}
                    </BodyShort>
                </div>
                <div className="bg-bg-default p-4 rounded-sm">
                    <Heading className="flex gap-1.5 items-center" size="small" level="3" spacing>
                        <CalendarIcon />
                        Perioder (f.o.m. - t.o.m.)
                    </Heading>
                    {sykmelding.values.aktivitet.map((it, index) => (
                        <BodyShort key={index}>{toReadableDatePeriod(it.fom, it.tom)}</BodyShort>
                    ))}
                </div>
                <div className="bg-bg-default p-4 rounded-sm">
                    <Heading className="flex gap-1.5 items-center" size="small" level="3" spacing>
                        <PillRectangleIcon />
                        Medisinsk tilstand
                    </Heading>
                    <BodyShort>{sykmelding.values.hoveddiagnose?.text ?? 'Ingen hoveddiagnose oppgitt'}</BodyShort>
                </div>
                <div className="bg-bg-default p-4 rounded-sm">
                    <Heading className="flex gap-1.5 items-center" size="small" level="3" spacing>
                        <InformationSquareIcon />
                        Annen info
                    </Heading>
                    <Checkbox readOnly checked={sykmelding.values.svangerskapsrelatert}>
                        Sykdommen er svangerskapsrelatert
                    </Checkbox>
                    <Checkbox readOnly checked={sykmelding.values.pasientenSkalSkjermes}>
                        Pasienten skal skjermes
                    </Checkbox>
                </div>
                <div className="bg-bg-default p-4 rounded-sm">
                    <Heading className="flex gap-1.5 items-center" size="small" level="3" spacing>
                        <InformationSquareIcon />
                        Meldinger til Nav
                    </Heading>
                    <BodyShort>{sykmelding.values.meldinger.tilNav ?? 'Ingen meldinger til Nav'}</BodyShort>
                </div>
                <div className="bg-bg-default p-4 rounded-sm">
                    <Heading className="flex gap-1.5 items-center" size="small" level="3" spacing>
                        <InformationSquareIcon />
                        Meldinger til Arbeidsgiver
                    </Heading>
                    <BodyShort>
                        {sykmelding.values.meldinger.tilArbeidsgiver ?? 'Ingen meldinger til arbeidsgiver'}
                    </BodyShort>
                </div>
            </div>
        </div>
    )
}

export default TidligereSykmelding
