import { z } from 'zod'

export type ExistingSykmelding = z.infer<typeof ExistingSykmeldingSchema>
export const ExistingSykmeldingSchema = z.object({
    sykmeldingId: z.string(),
})
