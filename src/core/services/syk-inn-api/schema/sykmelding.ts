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

export type SykInnApiAktivitetGradert = z.infer<typeof AktivitetGradertSchema>
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

export type RuleResult = z.infer<typeof RuleResultSchema>
const RuleResultSchema = z.object({
    result: z.union([z.literal('OK'), z.literal('PENDING'), z.literal('INVALID')]),
    melding: z.string().nullable(),
})

const TilbakedateringSchema = z.object({
    startdato: z.string(),
    begrunnelse: z.string(),
})

const UtdypendeSporsmalSchema = z.object({
    utfordringerMedArbeid: z.string().nullable(),
    medisinskOppsummering: z.string().nullable(),
    hensynPaArbeidsplassen: z.string().nullable(),
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

const SykInnApiSykmeldingMeta = z.object({
    pasientIdent: z.string(),
    sykmelder: SykmelderSchema,
    legekontorOrgnr: z.string().nullable(),
    legekontorTlf: z.string().nullable(),
    mottatt: z.string(),
})

export type SykInnApiSykmelding = z.infer<typeof SykInnApiSykmeldingSchema>
export const SykInnApiSykmeldingSchema = z
    .object({
        sykmeldingId: z.string(),
        meta: SykInnApiSykmeldingMeta,
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
            utdypendeSporsmal: UtdypendeSporsmalSchema.nullable(),
            annenFravarsgrunn: z.string().nullable(),
        }),
        utfall: RuleResultSchema,
    })
    .transform((it) => ({
        kind: 'full' as const,
        ...it,
    }))

export type SykInnApiSykmeldingRedacted = z.infer<typeof SykInnApiSykmeldingRedactedSchema>
export const SykInnApiSykmeldingRedactedSchema = z
    .object({
        sykmeldingId: z.string(),
        meta: SykInnApiSykmeldingMeta,
        values: z.object({
            aktivitet: z.array(
                z.object({
                    fom: z.string(),
                    tom: z.string(),
                    type: z.string(),
                }),
            ),
        }),
        utfall: RuleResultSchema,
    })
    .transform((it) => ({
        kind: 'redacted' as const,
        ...it,
    }))

export type SykInnApiRuleOutcome = z.infer<typeof SykInnApiRuleOutcomeSchema>
export const SykInnApiRuleOutcomeSchema = z.object({
    status: z.union([z.literal('INVALID'), z.literal('MANUAL_PROCESSING')]),
    message: z.string(),
    rule: z.string(),
    tree: z.string(),
})

export type SykInnApiPersonDoesNotExist = z.infer<typeof SykInnApiPersonDoesNotExistSchema>
export const SykInnApiPersonDoesNotExistSchema = z.object({
    message: z.literal('Person does not exist'),
})
