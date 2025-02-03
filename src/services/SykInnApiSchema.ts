import { z } from 'zod'

import { DateOnly } from '@utils/zod'

export type ExistingSykmelding = z.infer<typeof ExistingSykmeldingSchema>
export const ExistingSykmeldingSchema = z.object({
    sykmeldingId: z.string(),
    periode: z.object({
        fom: DateOnly,
        tom: DateOnly,
    }),
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
