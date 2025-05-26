import z from 'zod'

export type Konsultasjon = z.infer<typeof KonsultasjonSchema>
export const KonsultasjonSchema = z.object({
    diagnoser: z.array(
        z.object({
            system: z.enum(['ICD10', 'ICPC2']),
            code: z.string(),
            text: z.string(),
        }),
    ),
})
