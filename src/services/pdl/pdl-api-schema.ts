import * as z from 'zod'

import { DateOnly } from '@utils/zod'

export type PdlPerson = z.infer<typeof PdlPersonSchema>
export const PdlPersonSchema = z.object({
    navn: z.object({
        fornavn: z.string(),
        mellomnavn: z.string().nullable(),
        etternavn: z.string(),
    }),
    foedselsdato: DateOnly,
    identer: z.array(
        z.object({
            ident: z.string(),
            gruppe: z.union([z.literal('AKTORID'), z.literal('FOLKEREGISTERIDENT'), z.literal('NPID')]),
            historisk: z.boolean(),
        }),
    ),
})
