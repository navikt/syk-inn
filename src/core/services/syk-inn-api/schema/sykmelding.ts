import * as z from 'zod'

import { DiagnoseSchema } from '@data-layer/common/diagnose'

const BaseAktivitetSchema = z.object({
    fom: z.string(),
    tom: z.string(),
})

export type SykInnApiAktivitetIkkeMulig = z.infer<typeof AktivitetIkkeMuligSchema>
const AktivitetIkkeMuligSchema = BaseAktivitetSchema.extend({
    type: z.literal('AKTIVITET_IKKE_MULIG'),
    // TODO: Mark as non-nullable once data is migrated in syk-inn-api
    medisinskArsak: z
        .object({
            isMedisinskArsak: z.boolean(),
        })
        .optional(),
    // TODO: Mark as non-nullable once data is migrated in syk-inn-api
    arbeidsrelatertArsak: z
        .object({
            isArbeidsrelatertArsak: z.boolean(),
            arbeidsrelaterteArsaker: z.array(z.enum(['TILRETTELEGGING_IKKE_MULIG', 'ANNET'])),
            annenArbeidsrelatertArsak: z.string().nullable(),
        })
        .optional(),
})

const AktivitetGradertSchema = BaseAktivitetSchema.extend({
    type: z.literal('GRADERT'),
    grad: z.number(),
    reisetilskudd: z.boolean(),
})

const AktivitetBehandlingsdagerSchema = BaseAktivitetSchema.extend({
    type: z.literal('BEHANDLINGSDAGER'),
    antallBehandlingsdager: z.number(),
})

const AktivitetAvventendeSchema = BaseAktivitetSchema.extend({
    type: z.literal('AVVENTENDE'),
    innspillTilArbeidsgiver: z.string(),
})

const AktivitetReisetilskuddSchema = BaseAktivitetSchema.extend({
    type: z.literal('REISETILSKUDD'),
})

export type SykInnApiAktivitet = z.infer<typeof AktivitetSchema>
const AktivitetSchema = z.discriminatedUnion('type', [
    AktivitetIkkeMuligSchema,
    AktivitetGradertSchema,
    AktivitetBehandlingsdagerSchema,
    AktivitetAvventendeSchema,
    AktivitetReisetilskuddSchema,
])

const RuleResultSchema = z.object({
    result: z.string(),
    melding: z.string().nullable(),
})

const TilbakedateringSchema = z.object({
    startdato: z.string(),
    begrunnelse: z.string(),
})

const ArbeidsgiverSchema = z.object({
    harFlere: z.boolean(),
    arbeidsgivernavn: z.string(),
})

const YrkesskadeSchema = z.object({
    yrkesskade: z.boolean(),
    skadedato: z.string().nullable(),
})

const MeldingerSchema = z.object({
    tilNav: z.string().nullable(),
    tilArbeidsgiver: z.string().nullable(),
})

const SykmelderSchema = z.object({
    hprNummer: z.string(),
    fornavn: z.string().nullable(),
    mellomnavn: z.string().nullable(),
    etternavn: z.string().nullable(),
})

export type SykInnApiSykmelding = z.infer<typeof SykInnApiSykmeldingSchema>
export const SykInnApiSykmeldingSchema = z.object({
    sykmeldingId: z.string(),
    meta: z.object({
        pasientIdent: z.string(),
        sykmelder: SykmelderSchema,
        legekontorOrgnr: z.string(),
        legekontorTlf: z.string().nullable(),
        mottatt: z.string(),
    }),
    values: z.object({
        hoveddiagnose: DiagnoseSchema.nullable(),
        bidiagnoser: z.array(DiagnoseSchema).nullable(),
        aktivitet: z.array(AktivitetSchema),
        svangerskapsrelatert: z.boolean(),
        pasientenSkalSkjermes: z.boolean(),
        meldinger: MeldingerSchema,
        yrkesskade: YrkesskadeSchema.nullable(),
        arbeidsgiver: ArbeidsgiverSchema.nullable(),
        tilbakedatering: TilbakedateringSchema.nullable(),
    }),
    utfall: RuleResultSchema,
})

export type SykInnApiRuleOutcome = z.infer<typeof SykInnApiRuleOutcomeSchema>
export const SykInnApiRuleOutcomeSchema = z.object({
    status: z.string(),
    message: z.string(),
    rule: z.string(),
    tree: z.string(),
})
