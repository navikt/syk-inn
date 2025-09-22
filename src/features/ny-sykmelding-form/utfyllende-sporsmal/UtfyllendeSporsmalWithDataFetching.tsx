import { ReactElement } from 'react'
import { useQuery } from '@apollo/client/react'
import { Skeleton, TextField } from '@navikt/ds-react'

import FormSection from '@components/form/form-section/FormSection'
import { AllSykmeldingerDocument } from '@data-layer/graphql/queries.generated'
import {
    shouldShowUtfyllendeSporsmal,
    sortAndFilter,
} from '@features/dashboard/dumb-stats/continuous-sykefravaer-utils'
import { useController, useFormContext } from '@features/ny-sykmelding-form/form'

export function UtfyllendeSporsmalWithDataFetching(): ReactElement | null {
    const alleSykmeldinger = useQuery(AllSykmeldingerDocument)
    const perioder = useFormContext().getValues('perioder') ?? []

    const utfodringerMedArbeid = useController({
        name: 'utdypendeSporsmal.utfodringerMedArbeid',
    })

    const medisinskOppsummering = useController({
        name: 'utdypendeSporsmal.medisinskOppsummering',
    })

    const hensynPaArbeidsplassen = useController({
        name: 'utdypendeSporsmal.hensynPaArbeidsplassen',
    })

    if (alleSykmeldinger.loading) {
        return <Skeleton variant="rounded" className="w-50 h-full" />
    }

    const sykmeldinger = sortAndFilter(alleSykmeldinger.data?.sykmeldinger ?? [])

    if (!shouldShowUtfyllendeSporsmal(sykmeldinger, perioder)) {
        // Todo: Allow sykmelder to fill out anyway?
        return null
    }

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
                label="Hvilke hensyn må være på plass for at pasienten kan prøves i det nåværende arbeidet?"
                onChange={hensynPaArbeidsplassen.field.onChange}
                value={hensynPaArbeidsplassen.field.value ?? ''}
                error={hensynPaArbeidsplassen.fieldState.error?.message}
            />
        </FormSection>
    )
}
