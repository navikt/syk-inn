import * as z from 'zod/v4'

export type ICD10_OID = typeof ICD10_OID_VALUE
export const ICD10_OID_VALUE = '2.16.578.1.12.4.1.1.7110'

export type ICPC2_OID = typeof ICPC2_OID_VALUE
export const ICPC2_OID_VALUE = '2.16.578.1.12.4.1.1.7170'

export type DiagnoseSystem = z.infer<typeof DiagnoseSystemSchema>
export const DiagnoseSystemSchema = z.enum(['ICD10', 'ICPC2'])

export const DiagnoseSchema = z.object({
    system: DiagnoseSystemSchema,
    code: z.string(),
    text: z.string(),
})
