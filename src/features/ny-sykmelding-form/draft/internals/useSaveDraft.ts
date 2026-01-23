import { useMutation } from '@apollo/client/react'
import { useCallback } from 'react'
import * as R from 'remeda'

import { GetAllDraftsDocument, SaveDraftDocument, SaveDraftMutation, SaveDraftMutationVariables } from '@queries'
import { spanBrowserAsync } from '@lib/otel/browser'
import { DraftValues } from '@data-layer/draft/draft-schema'

import { NySykmeldingMainFormValues } from '../../form/types'

export function useSaveDraft(opts: {
    onCompleted?: () => void
}): [
    (
        draftId: string,
        values: NySykmeldingMainFormValues,
    ) => ReturnType<useMutation.MutationFunction<SaveDraftMutation, SaveDraftMutationVariables>>,
    useMutation.Result<SaveDraftMutation>,
] {
    const [mutation, draftResult] = useMutation(SaveDraftDocument, {
        onCompleted: () => {
            opts.onCompleted?.()
        },
        refetchQueries: [{ query: GetAllDraftsDocument }],
        awaitRefetchQueries: true,
    })

    const mutationWithMappedValues = useCallback(
        async (draftId: string, values: NySykmeldingMainFormValues) => {
            const mappedValues: DraftValues = mapFormValuesToDraftValues(values)
            return spanBrowserAsync('SaveDraft.mutation', async () =>
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
            medisinskArsak: periode.medisinskArsak,
            arbeidsrelatertArsak: periode.arbeidsrelatertArsak,
        })),
        hoveddiagnose: values.diagnoser.hoved ? values.diagnoser.hoved : null,
        bidiagnoser: (values.diagnoser.bidiagnoser ?? []).filter(R.isNonNull).map((it) => ({
            system: it.system,
            code: it.code,
            text: it.text,
        })),
        tilbakedatering:
            values.tilbakedatering != null
                ? {
                      fom: values.tilbakedatering.fom,
                      grunn: values.tilbakedatering.grunn,
                      annenGrunn: values.tilbakedatering.annenGrunn ?? null,
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
        utdypendeSporsmal: {
            utfordringerMedArbeid: values.utdypendeSporsmal?.utfordringerMedArbeid ?? null,
            medisinskOppsummering: values.utdypendeSporsmal?.medisinskOppsummering ?? null,
            hensynPaArbeidsplassen: values.utdypendeSporsmal?.hensynPaArbeidsplassen ?? null,
            sykdomsutvikling: values.utdypendeSporsmal?.sykdomsutvikling ?? null,
            utfordringerHelsetilstand: values.utdypendeSporsmal?.utfordringerHelsetilstand ?? null,
            behandlingOgFremtidigArbeid: values.utdypendeSporsmal?.behandlingOgFremtidigArbeid ?? null,
            uavklarteForhold: values.utdypendeSporsmal?.uavklarteForhold ?? null,
            oppdatertMedisinskOppsummering: values.utdypendeSporsmal?.oppdatertMedisinskOppsummering ?? null,
            mestringArbeidshverdag: values.utdypendeSporsmal?.mestringArbeidshverdag ?? null,
            forventetHelsetilstandUtvikling: values.utdypendeSporsmal?.forventetHelsetilstandUtvikling ?? null,
            medisinskeHensyn: values.utdypendeSporsmal?.medisinskeHensyn ?? null,
        },
        annenFravarsgrunn: {
            harFravarsgrunn: values.annenFravarsgrunn.harFravarsgrunn,
            fravarsgrunn: values.annenFravarsgrunn.fravarsgrunn,
        },
    }
}
