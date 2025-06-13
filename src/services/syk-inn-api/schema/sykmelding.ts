import { z } from 'zod/v4'

import { DiagnoseSchema } from '../../../data-layer/common/diagnose'

const AktivitetIkkeMuligSchema = z.object({
    type: z.literal('AKTIVITET_IKKE_MULIG'),
    fom: z.string(),
    tom: z.string(),
})

const AktivitetGradertSchema = z.object({
    type: z.literal('GRADERT'),
    grad: z.number(),
    fom: z.string(),
    tom: z.string(),
    reisetilskudd: z.boolean(),
})

const AktivitetBehandlingsdagerSchema = z.object({
    type: z.literal('BEHANDLINGSDAGER'),
    antallBehandlingsdager: z.number(),
    fom: z.string(),
    tom: z.string(),
})

const AktivitetAvventendeSchema = z.object({
    type: z.literal('AVVENTENDE'),
    innspillTilArbeidsgiver: z.string(),
    fom: z.string(),
    tom: z.string(),
})

const AktivitetReisetilskuddSchema = z.object({
    type: z.literal('REISETILSKUDD'),
    fom: z.string(),
    tom: z.string(),
})

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
    startdato: z.string(), // use z.coerce.date() if desired
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

export type SykInnApiSykmelding = z.infer<typeof SykInnApiSykmeldingSchema>
export const SykInnApiSykmeldingSchema = z.object({
    sykmeldingId: z.string(),
    meta: z.object({
        pasientIdent: z.string(),
        sykmelderHpr: z.string(),
        legekontorOrgnr: z.string(),
        mottatt: z.string(),
    }),
    values: z.object({
        hoveddiagnose: DiagnoseSchema.nullable(),
        bidiagnoser: z.array(DiagnoseSchema),
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
