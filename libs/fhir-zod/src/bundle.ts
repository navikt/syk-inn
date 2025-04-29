/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { z } from 'zod'

export type FhirBundle<Resource> = z.infer<ReturnType<typeof createFhirBundleSchema<Resource>>>
export function createFhirBundleSchema<T>(ResourceSchema: z.ZodType<T>) {
    return z.object({
        resourceType: z.literal('Bundle'),
        type: z.literal('searchset'),
        entry: z.array(
            z.object({
                resource: ResourceSchema,
            }),
        ),
    })
}
