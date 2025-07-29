import * as z from 'zod'

export type TilbakedateringGrunn = z.infer<typeof TilbakedateringGrunnSchema>
export const TilbakedateringGrunnSchema = z.enum([
    'VENTETID_LEGETIME',
    'MANGLENDE_SYKDOMSINNSIKT_GRUNNET_ALVORLIG_PSYKISK_SYKDOM',
    'ANNET',
])
