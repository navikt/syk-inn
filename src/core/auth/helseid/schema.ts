import * as z from 'zod'

const HprDetailsSchema = z.object({
    approvals: z.array(
        z.object({
            profession: z.string(),
            authorization: z.object({ value: z.string(), description: z.string() }),
            requisition_rights: z.array(z.object({ value: z.string(), description: z.string() })),
            specialities: z.array(z.unknown()),
        }),
    ),
    hpr_number: z.number().transform((it) => `${it}`),
})

export type UserInfo = z.infer<typeof UserInfoSchema>
export const UserInfoSchema = z
    .object({
        'helseid://claims/hpr/hpr_details': HprDetailsSchema,
    })
    .loose()

export type HelseIdIdToken = z.infer<typeof HelseIdIdTokenSchema>
export const HelseIdIdTokenSchema = z
    .object({
        'helseid://claims/identity/pid': z.string(),
        'helseid://claims/hpr/hpr_number': z.string().nullable().optional(),
        name: z.string(),
    })
    .loose()
