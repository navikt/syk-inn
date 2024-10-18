import { z } from 'zod'

export type Name = z.infer<typeof NameSchema>
export const NameSchema = z.array(z.object({ family: z.string(), given: z.array(z.string()) }))
