import { z } from 'zod'

import { DateOnly } from '@utils/zod'

export type SubmitSykmeldingFormValues = z.infer<typeof SubmitSykmeldingFormValuesSchema>
export const SubmitSykmeldingFormValuesSchema = z.object({
    pasient: z.string().optional(),
    diagnoser: z.object({
        hoved: z.object({
            system: z.union([z.literal('ICD10'), z.literal('ICPC2')]),
            code: z.string(),
        }),
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
    ]),
})

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
    ]),
    pasient: z.object({
        fnr: z.string(),
    }),
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
