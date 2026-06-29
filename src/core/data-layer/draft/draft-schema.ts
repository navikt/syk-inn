import { logger } from '@navikt/next-logger'
import * as z from 'zod'

import { NySykmeldingFormVariantType } from '#features/ny-sykmelding-form/useFormVariant'

import { TilbakedateringGrunnSchema } from '../common/tilbakedatering'

export type DraftValues = z.infer<typeof DraftValuesSchema>
export const DraftValuesSchema = z.object({
    arbeidsforhold: z
        .object({
            harFlereArbeidsforhold: z.enum(['JA', 'NEI']).nullable(),
            sykmeldtFraArbeidsforhold: z.string().nullable(),
        })
        .nullable(),
    perioder: z
        .array(
            z.object({
                type: z.enum(['GRADERT', 'AKTIVITET_IKKE_MULIG', 'BEHANDLINGSDAGER', 'REISETILSKUDD']),
                fom: z.string().nullable(),
                tom: z.string().nullable(),
                grad: z.string().nullable().optional(),
                gradertReisetilksudd: z.boolean().nullable().optional(),
                arbeidsrelatertArsak: z
                    .object({
                        isArbeidsrelatertArsak: z.boolean().nullable(),
                        arbeidsrelaterteArsaker: z.array(z.enum(['MANGLENDE_TILRETTELEGGING', 'ANNET'])).nullable(),
                        annenArbeidsrelatertArsak: z.string().nullable(),
                    })
                    .nullable(),
            }),
        )
        .nullable(),
    hoveddiagnose: z
        .object({
            system: z.enum(['ICD10', 'ICPC2', 'ICPC2B']),
            code: z.string(),
            text: z.string(),
        })
        .nullable(),
    bidiagnoser: z
        .array(
            z.object({
                system: z.enum(['ICD10', 'ICPC2', 'ICPC2B']),
                code: z.string(),
                text: z.string(),
            }),
        )
        .nullable(),
    tilbakedatering: z
        .object({
            fom: z.string().nullable(),
            grunn: TilbakedateringGrunnSchema.nullable(),
            annenGrunn: z.string().nullable(),
        })
        .nullable(),
    meldinger: z
        .object({
            showTilNav: z.boolean(),
            tilNav: z.string().nullable(),
            showTilArbeidsgiver: z.boolean(),
            tilArbeidsgiver: z.string().nullable(),
        })
        .nullable(),
    svangerskapsrelatert: z.boolean().nullable(),
    yrkesskade: z
        .object({
            yrkesskade: z.boolean(),
            skadedato: z.string().nullable(),
        })
        .nullable(),
    utdypendeSporsmal: z
        .object({
            utfordringerMedArbeid: z.string().nullable(),
            medisinskOppsummering: z.string().nullable(),
            hensynPaArbeidsplassen: z.string().nullable(),
            sykdomsutvikling: z.string().nullable(),
            arbeidsrelaterteUtfordringer: z.string().nullable(),
            behandlingOgFremtidigArbeid: z.string().nullable(),
            uavklarteForhold: z.string().nullable(),
            oppdatertMedisinskStatus: z.string().nullable(),
            realistiskMestringArbeid: z.string().nullable(),
            forventetHelsetilstandUtvikling: z.string().nullable(),
            medisinskeHensyn: z.string().nullable(),
        })
        .nullable(),
    annenFravarsgrunn: z
        .object({
            harFravarsgrunn: z.boolean(),
            fravarsgrunn: z.string().nullable(),
        })
        .nullable(),
})

/**
 * The draft blob can be stale or broken, this will not throw in the draft is broken.
 */
export function safeParseDraft(draftId: string | null | undefined, potentialDraft: unknown): DraftValues | null {
    if (potentialDraft == null) return null

    const result = DraftValuesSchema.safeParse(potentialDraft)
    if (result.success) {
        return result.data
    } else {
        logger.error(
            new Error(`Tried to parse draft, but got invalid data, id: ${draftId ?? 'null'}`, {
                cause: result.error,
            }),
        )
        return null
    }
}

export function inferSykmeldingTypeFromDraft(parsedDraft: DraftValues | null): NySykmeldingFormVariantType {
    if (parsedDraft == null) return 'NORMAL'

    const hasBehandlingsdagerAktivitet = parsedDraft?.perioder?.find((it) => it.type === 'BEHANDLINGSDAGER')
    if (hasBehandlingsdagerAktivitet) return 'BEHANDLINGSDAGER'

    const hasReisetilskudd = parsedDraft.perioder?.find(
        (it) => it.type === 'REISETILSKUDD' || (it.type === 'GRADERT' && it.gradertReisetilksudd === true),
    )
    if (hasReisetilskudd) return 'REISETILSKUDD'

    return 'NORMAL'
}
