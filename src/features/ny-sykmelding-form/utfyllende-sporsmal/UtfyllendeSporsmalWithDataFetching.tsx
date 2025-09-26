import { ReactElement, useMemo } from 'react'
import { TextField } from '@navikt/ds-react'
import * as R from 'remeda'

import FormSection from '@components/form/form-section/FormSection'
import {
    currentSykmeldingIsAktivitetIkkeMulig,
    SykmeldingDateRange,
} from '@features/dashboard/dumb-stats/continuous-sykefravaer-utils'
import { useController, useFormContext } from '@features/ny-sykmelding-form/form'
import { raise } from '@lib/ts'

export function UtdypendeSporsmal({
    previousSykmeldingDateRange,
    hasAnsweredUtdypendeSporsmal,
}: {
    previousSykmeldingDateRange?: SykmeldingDateRange[]
    hasAnsweredUtdypendeSporsmal?: boolean
}): ReactElement | null {
    //const alleSykmeldinger = useQuery(AllSykmeldingerDocument)
    const perioder = useFormContext().getValues('perioder') ?? []
    /*
    const sykmeldinger = sortAndFilter(alleSykmeldinger.data?.sykmeldinger ?? [])

    if (!shouldShowUtfyllendeSporsmal(sykmeldinger, perioder)) {
        // Todo: Allow sykmelder to fill out anyway?
        return null
    }*/

    const shouldShowUtdypendeSporsmal = useMemo(() => {
        if (hasAnsweredUtdypendeSporsmal) return false

        const aktivitetIkkeMulig = currentSykmeldingIsAktivitetIkkeMulig(perioder)
        if (!aktivitetIkkeMulig) return false

        console.log('UtdypendeSporsmal - aktivitetIkkeMulig', aktivitetIkkeMulig)

        const currentPeriode: SykmeldingDateRange[] =
            perioder?.length > 0
                ? [
                      {
                          earliestFom: R.firstBy(perioder, [(it) => it.periode.fom ?? '', 'desc'])?.periode.fom,
                          latestTom: R.firstBy(perioder, [(it) => it.periode.tom ?? '', 'desc'])?.periode.tom,
                      },
                  ]
                : []
        return [...(previousSykmeldingDateRange ?? []), ...currentPeriode]
    }, [previousSykmeldingDateRange, perioder, hasAnsweredUtdypendeSporsmal])

    if (shouldShowUtdypendeSporsmal) {
        return <Uke7 />
    }

    return null
}

function Uke7() {
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
        <FormSection title="Utdypende spørsmål">
            <TextField
                label="Hvilke utfordringer har pasienten med å utføre gradert arbeid?"
                onChange={utfodringerMedArbeid.field.onChange}
                value={utfodringerMedArbeid.field.value ?? ''}
                error={utfodringerMedArbeid.fieldState.error?.message}
            />
            <TextField
                label="Gi en kort medisinsk oppsummering av tilstanden (sykehistorie, hovedsymptomer, pågående/planlagt behandling)"
                onChange={medisinskOppsummering.field.onChange}
                value={medisinskOppsummering.field.value ?? ''}
                error={medisinskOppsummering.fieldState.error?.message}
            />
            <TextField
                label="Hvilke hensyn må være på plass for at pasienten kan prøves i det nåværende arbeidet? (ikke obligatorisk)"
                onChange={hensynPaArbeidsplassen.field.onChange}
                value={hensynPaArbeidsplassen.field.value ?? ''}
                error={hensynPaArbeidsplassen.fieldState.error?.message}
            />
        </FormSection>
    )
}
