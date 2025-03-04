import { z } from 'zod'

export type FhirDocumentReferenceResponse = z.infer<typeof FhirDocumentReferenceResponseSchema>
export const FhirDocumentReferenceResponseSchema = z.object({
    resourceType: z.literal('DocumentReference'),
    id: z.string(),
    meta: z.object({
        versionId: z.string(),
        lastUpdated: z.string(),
    }),
})

export type FhirDocumentReference = z.infer<typeof FhirDocumentReferenceSchema>
export const FhirDocumentReferenceSchema = z.object({
    resourceType: z.literal('DocumentReference'),
    status: z.string(),
    type: z.object({
        coding: z.array(
            z.object({
                system: z.string(),
                code: z.string(),
                display: z.string(),
            }),
        ),
    }),
    subject: z.object({ reference: z.string() }),
    author: z.array(
        z.object({
            reference: z.string(),
        }),
    ),
    description: z.string(),
    content: z.array(
        z.object({
            attachment: z.object({
                title: z.string(),
                language: z.string(),
                contentType: z.string(),
                data: z.string(),
            }),
        }),
    ),
    context: z.object({
        encounter: z.array(
            z.object({
                reference: z.string(),
            }),
        ),
    }),
})
