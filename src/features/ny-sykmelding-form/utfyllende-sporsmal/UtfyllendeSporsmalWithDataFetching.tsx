import { ReactElement } from 'react'
import { useQuery } from '@apollo/client/react'
import { Skeleton } from '@navikt/ds-react'

import FormSection from '@components/form/form-section/FormSection'
import { AllSykmeldingerDocument } from '@data-layer/graphql/queries.generated'
import {
    shouldShowUtfyllendeSporsmal,
    sortAndFilter,
} from '@features/dashboard/dumb-stats/continuous-sykefravaer-utils'
import { useFormContext } from '@features/ny-sykmelding-form/form'

export function UtfyllendeSporsmalWithDataFetching(): ReactElement | null {
    const alleSykmeldinger = useQuery(AllSykmeldingerDocument)
    const perioder = useFormContext().getValues('perioder') ?? []

    if (alleSykmeldinger.loading) {
        return <Skeleton variant="rounded" className="w-50 h-full" />
    }

    const sykmeldinger = sortAndFilter(alleSykmeldinger.data?.sykmeldinger ?? [])

    if (!shouldShowUtfyllendeSporsmal(sykmeldinger, perioder)) {
        // Todo: Allow sykmelder to fill out anyway?
        return null
    }

    return <FormSection title="Uke 7 spørsmål">Hello pello, dette er uke 7 spørsmål</FormSection>
}
