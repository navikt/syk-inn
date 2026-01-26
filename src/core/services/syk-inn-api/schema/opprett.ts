import * as z from 'zod'

import { DateOnly } from '@lib/zod'
import { DiagnoseSystemSchema } from '@data-layer/common/diagnose'

export type OpprettSykmeldingMeta = z.infer<typeof OpprettSykmeldingMetaSchema>
const OpprettSykmeldingMetaSchema = z.object({
    source: z.string(),
    pasientIdent: z.string(),
    sykmelderHpr: z.string(),
    legekontorOrgnr: z.string(),
    legekontorTlf: z.string(),
})

const OpprettSykmeldingDiagnoseSchema = z.object({
    system: DiagnoseSystemSchema,
    code: z.string(),
})

export const UtdypendeSporsmalSchema = z.object({
    sporsmalstekst: z.string(),
    svar: z.string(),
})

export type OpprettSykmeldingAktivitet = z.infer<typeof OpprettSykmeldingAktivitetSchema>
const OpprettSykmeldingAktivitetSchema = z.discriminatedUnion('type', [
    z.object({
        type: z.literal('AKTIVITET_IKKE_MULIG'),
        fom: DateOnly,
        tom: DateOnly,
        medisinskArsak: z.object({
            isMedisinskArsak: z.boolean(),
        }),
        arbeidsrelatertArsak: z.object({
            isArbeidsrelatertArsak: z.boolean(),
            arbeidsrelaterteArsaker: z.array(z.enum(['TILRETTELEGGING_IKKE_MULIG', 'ANNET'])),
            annenArbeidsrelatertArsak: z.string().nullable(),
        }),
    }),
    z.object({
        type: z.literal('GRADERT'),
        fom: DateOnly,
        tom: DateOnly,
        grad: z.number().min(1).max(99),
        reisetilskudd: z.boolean(),
    }),
    z.object({
        type: z.literal('AVVENTENDE'),
        fom: DateOnly,
        tom: DateOnly,
        innspillTilArbeidsgiver: z.string(),
    }),
    z.object({
        type: z.literal('BEHANDLINGSDAGER'),
        fom: DateOnly,
        tom: DateOnly,
        antallBehandlingsdager: z.number(),
    }),
    z.object({
        type: z.literal('REISETILSKUDD'),
        fom: DateOnly,
        tom: DateOnly,
    }),
])
export type OpprettSykmeldingPayload = z.infer<typeof OpprettSykmeldingPayloadSchema>
export const OpprettSykmeldingPayloadSchema = z.object({
    submitId: z.uuid(),
    meta: OpprettSykmeldingMetaSchema,
    values: z.object({
        pasientenSkalSkjermes: z.boolean(),
        hoveddiagnose: OpprettSykmeldingDiagnoseSchema,
        bidiagnoser: z.array(OpprettSykmeldingDiagnoseSchema),
        aktivitet: z.array(OpprettSykmeldingAktivitetSchema),
        meldinger: z.object({
            tilNav: z.string().nullable(),
            tilArbeidsgiver: z.string().nullable(),
        }),
        svangerskapsrelatert: z.boolean(),
        yrkesskade: z
            .object({
                yrkesskade: z.boolean(),
                skadedato: DateOnly.nullable(),
            })
            .nullable(),
        arbeidsgiver: z
            .object({
                arbeidsgivernavn: z.string(),
            })
            .nullable(),
        tilbakedatering: z
            .object({
                startdato: DateOnly,
                begrunnelse: z.string(),
            })
            .nullable(),
        utdypendeSporsmal: z
            .object({
                utfordringerMedArbeid: z.string().nullable(),
                medisinskOppsummering: z.string().nullable(),
                hensynPaArbeidsplassen: z.string().nullable(),
            })
            .nullable(),
        utdypendeSporsmalAnswerOptions: z.object({
            utfordringerMedArbeid: UtdypendeSporsmalSchema.nullable(),
            medisinskOppsummering: UtdypendeSporsmalSchema.nullable(),
            hensynPaArbeidsplassen: UtdypendeSporsmalSchema.nullable(),
        }),
        annenFravarsgrunn: z.string().nullable(),
    }),
})
