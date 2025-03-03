import { z } from 'zod'

import { DateOnly } from '@utils/zod'

export type ExistingSykmelding = z.infer<typeof ExistingSykmeldingSchema>
export const ExistingSykmeldingSchema = z.object({
    sykmeldingId: z.string(),
    aktivitet: z.discriminatedUnion('type', [
        z.object({
            type: z.literal('AKTIVITET_IKKE_MULIG'),
            fom: DateOnly,
            tom: DateOnly,
        }),
        z.object({
            type: z.literal('GRADERT'),
            fom: DateOnly,
            tom: DateOnly,
            grad: z
                .string()
                .transform((it) => +it)
                .pipe(z.number().min(1).max(99)),
        }),
        z.object({
            type: z.literal('AVVENTENDE'),
            fom: DateOnly,
            tom: DateOnly,
        }),
        z.object({
            type: z.literal('BEHANDLINGSDAGER'),
            fom: DateOnly,
            tom: DateOnly,
        }),
        z.object({
            type: z.literal('REISETILSKUDD'),
            fom: DateOnly,
            tom: DateOnly,
        }),
    ]),
    pasient: z.object({
        fnr: z.string(),
    }),
    hovedDiagnose: z.object({
        system: z.string(),
        code: z.string(),
        text: z.string(),
    }),
    pdf: z.string(),
})

export type ExistingSykmeldinger = z.infer<typeof ExistingSykmeldingerSchema>
export const ExistingSykmeldingerSchema = z.object({
    sykmeldingId: z.string(),
    pasient: z.object({
        fnr: z.string(),
    }),
    aktivitet: z.discriminatedUnion('type', [
        z.object({
            type: z.literal('AKTIVITET_IKKE_MULIG'),
            fom: DateOnly,
            tom: DateOnly,
        }),
        z.object({
            type: z.literal('GRADERT'),
            fom: DateOnly,
            tom: DateOnly,
            grad: z
                .string()
                .transform((it) => +it)
                .pipe(z.number().min(1).max(99)),
        }),
        z.object({
            type: z.literal('AVVENTENDE'),
            fom: DateOnly,
            tom: DateOnly,
        }),
        z.object({
            type: z.literal('BEHANDLINGSDAGER'),
            fom: DateOnly,
            tom: DateOnly,
        }),
        z.object({
            type: z.literal('REISETILSKUDD'),
            fom: DateOnly,
            tom: DateOnly,
        }),
    ]),
    hovedDiagnose: z.object({
        system: z.string(),
        code: z.string(),
        text: z.string(),
    }),
})

export type NySykmelding = z.infer<typeof NySykmeldingSchema>
export const NySykmeldingSchema = z.object({
    sykmeldingId: z.string(),
})
