import { FetchResult, MutationResult, useMutation } from '@apollo/client'
import { useCallback } from 'react'
import { useRouter } from 'next/navigation'

import { GetAllDraftsDocument, GetDraftDocument, SaveDraftDocument, SaveDraftMutation } from '@queries'
import { NySykmeldingMainFormValues } from '@components/ny-sykmelding-form/form'
import { spanAsync } from '@otel/otel'

import { DraftValues } from '../../../data-layer/draft/draft-schema'
import { useMode } from '../../../providers/ModeProvider'

export function useSaveDraft(opts: {
    returnToDash: boolean
    onCompleted?: () => void
}): [
    (draftId: string, values: NySykmeldingMainFormValues) => Promise<FetchResult<SaveDraftMutation>>,
    MutationResult<SaveDraftMutation>,
] {
    const router = useRouter()
    const mode = useMode()

    const [mutation, draftResult] = useMutation(SaveDraftDocument, {
        onCompleted: () => {
            opts.onCompleted?.()

            if (opts.returnToDash) {
                const redirectPath = mode === 'FHIR' ? '/fhir' : '/ny'
                router.replace(redirectPath)
            }
        },
        refetchQueries: [GetAllDraftsDocument],
        awaitRefetchQueries: true,
        update(cache, { data }) {
            if (data?.saveDraft == null) return

            // Update the cache with the mutation data
            cache.writeQuery({
                query: GetDraftDocument,
                variables: { draftId: data.saveDraft.draftId },
                data: { draft: data.saveDraft },
            })
        },
    })

    const mutationWithMappedValues = useCallback(
        async (draftId: string, values: NySykmeldingMainFormValues) => {
            const mappedValues: DraftValues = mapFormValuesToDraftValues(values)
            return spanAsync('SaveDraft.mutation', async () =>
                mutation({
                    variables: { draftId, values: mappedValues satisfies DraftValues },
                }),
            )
        },
        [mutation],
    )

    return [mutationWithMappedValues, draftResult]
}

export function mapFormValuesToDraftValues(values: NySykmeldingMainFormValues): DraftValues {
    return {
        arbeidsforhold: {
            harFlereArbeidsforhold: values.arbeidsforhold.harFlereArbeidsforhold,
            sykmeldtFraArbeidsforhold: values.arbeidsforhold.sykmeldtFraArbeidsforhold ?? null,
        },
        perioder: values.perioder.map((periode) => ({
            type: periode.aktivitet.type,
            fom: periode.periode.fom,
            tom: periode.periode.tom,
            grad: periode.aktivitet.grad ?? null,
        })),
        hoveddiagnose: values.diagnoser.hoved ?? null,
        tilbakedatering:
            values.tilbakedatering != null
                ? {
                      fom: values.tilbakedatering.fom,
                      grunn: values.tilbakedatering.grunn,
                  }
                : null,
        meldinger: {
            showTilNav: values.meldinger.showTilNav,
            showTilArbeidsgiver: values.meldinger.showTilArbeidsgiver,
            tilNav: values.meldinger.tilNav,
            tilArbeidsgiver: values.meldinger.tilArbeidsgiver,
        },
        svangerskapsrelatert: values.andreSporsmal.svangerskapsrelatert,
        yrkesskade: {
            yrkesskade: values.andreSporsmal.yrkesskade?.yrkesskade ?? false,
            skadedato: values.andreSporsmal.yrkesskade?.skadedato ?? null,
        },
    }
}
