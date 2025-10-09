import { ReactElement } from 'react'
import { BodyShort, Textarea } from '@navikt/ds-react'
import * as R from 'remeda'

import FormSection from '@components/form/form-section/FormSection'
import {
    calculateTotalLengthOfSykmeldinger,
    currentSykmeldingIsAktivitetIkkeMulig,
    filterSykmeldingerWithinDaysGap,
    SykmeldingDateRange,
} from '@features/dashboard/dumb-stats/continuous-sykefravaer-utils'
import { useController, useFormContext } from '@features/ny-sykmelding-form/form'

export function UtdypendeSporsmal({
    previousSykmeldingDateRange,
    hasAnsweredUtdypendeSporsmal,
}: {
    previousSykmeldingDateRange?: SykmeldingDateRange[]
    hasAnsweredUtdypendeSporsmal?: boolean
}): ReactElement | null {
    const perioder = useFormContext().watch('perioder')

    const shouldShowUtdypendeSporsmal = (): boolean => {
        const DAYS_IN_7_WEEKS = 7 * 7
        if (hasAnsweredUtdypendeSporsmal) return false

        const aktivitetIkkeMulig = currentSykmeldingIsAktivitetIkkeMulig(perioder)

        if (!aktivitetIkkeMulig) return false

        // First check if we're above 7 weeks already
        const totalDaysExistingSykmeldinger = R.pipe(
            previousSykmeldingDateRange ?? [],
            filterSykmeldingerWithinDaysGap,
            calculateTotalLengthOfSykmeldinger,
        )
        if (totalDaysExistingSykmeldinger > DAYS_IN_7_WEEKS) return true

        // Check if adding current sykmelding will push above 8 weeks
        const currentPeriode: SykmeldingDateRange[] =
            perioder?.length > 0
                ? [
                      {
                          earliestFom: R.firstBy(perioder, [(it) => it.periode.fom ?? '', 'desc'])?.periode.fom ?? '',
                          latestTom: R.firstBy(perioder, [(it) => it.periode.tom ?? '', 'desc'])?.periode.tom ?? '',
                      },
                  ]
                : []

        const totalDays = R.pipe(
            [...(previousSykmeldingDateRange ?? []), ...currentPeriode],
            filterSykmeldingerWithinDaysGap,
            calculateTotalLengthOfSykmeldinger,
        )

        return totalDays > DAYS_IN_7_WEEKS + 7
    }

    if (shouldShowUtdypendeSporsmal()) {
        return <Uke7 />
    }

    return null
}

function Uke7(): ReactElement {
    const utfodringerMedArbeid = useController({
        name: 'utdypendeSporsmal.utfodringerMedArbeid',
        rules: { required: 'Du må fylle ut dette feltet' },
    })

    const medisinskOppsummering = useController({
        name: 'utdypendeSporsmal.medisinskOppsummering',
        rules: { required: 'Du må fylle ut dette feltet' },
    })

    const hensynPaArbeidsplassen = useController({
        name: 'utdypendeSporsmal.hensynPaArbeidsplassen',
    })
    return (
        <FormSection title="Utdypende spørsmål uke 8">
            <BodyShort spacing>Helseopplysninger i Navs vurdering av aktivitetskrav og oppfølging</BodyShort>
            <Textarea
                label="Hvilke utfordringer har pasienten med å utføre gradert arbeid?"
                onChange={utfodringerMedArbeid.field.onChange}
                value={utfodringerMedArbeid.field.value ?? ''}
                error={utfodringerMedArbeid.fieldState.error?.message}
            />
            <Textarea
                label="Gi en kort medisinsk oppsummering av tilstanden (sykehistorie, hovedsymptomer, pågående/planlagt behandling)"
                onChange={medisinskOppsummering.field.onChange}
                value={medisinskOppsummering.field.value ?? ''}
                error={medisinskOppsummering.fieldState.error?.message}
            />
            <Textarea
                label="Hvilke hensyn må være på plass for at pasienten kan prøves i det nåværende arbeidet? (ikke obligatorisk)"
                onChange={hensynPaArbeidsplassen.field.onChange}
                value={hensynPaArbeidsplassen.field.value ?? ''}
                error={hensynPaArbeidsplassen.fieldState.error?.message}
            />
        </FormSection>
    )
}
