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

export type PasientInfo = z.infer<typeof PasientInfoSchema>
export const PasientInfoSchema = z.object({
    ident: z.string(),
    navn: z.string(),
})

export type PersonQueryInfo = z.infer<typeof PersonQueryInfoSchema>
export const PersonQueryInfoSchema = z.object({
    ident: z.string().nullable(),
    navn: z.string(),
})
