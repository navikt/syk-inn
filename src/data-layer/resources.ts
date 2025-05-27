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

export type Sykmelding = z.infer<typeof SykmeldingSchema>
export const SykmeldingSchema = z.object({
    sykmeldingId: z.string(),
    aktivitet: z.union([
        z.object({
            type: z.literal('AKTIVITET_IKKE_MULIG'),
            fom: z.string(),
            tom: z.string(),
        }),
        z.object({
            type: z.literal('GRADERT'),
            grad: z.number(),
            fom: z.string(),
            tom: z.string(),
        }),
    ]),
    pasient: z.object({
        ident: z.string(),
    }),
    diagnose: z.object({
        hoved: z.object({
            system: z.string(),
            code: z.string(),
            text: z.string(),
        }),
    }),
})

export type CreatedSykmelding = z.infer<typeof CreatedSykmeldingSchema>
export const CreatedSykmeldingSchema = z.object({
    sykmeldingId: z.string(),
})
