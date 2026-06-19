import { useQueryState, parseAsStringLiteral } from 'nuqs'

import { SykmeldingFragment } from '#queries'

export const FORM_VARIANT_KEY = 'variant'

const variants = ['NORMAL', 'BEHANDLINGSDAGER'] as const

export type NySykmeldingFormVariantType = (typeof variants)[number]

export function useFormVariant(): NySykmeldingFormVariantType {
    const [variant] = useQueryState(FORM_VARIANT_KEY, parseAsStringLiteral(variants))

    return variant ?? 'NORMAL'
}

export function inferSykmeldingType(sykmelding: SykmeldingFragment): NySykmeldingFormVariantType {
    if (sykmelding.values.aktivitet[0].type === 'BEHANDLINGSDAGER') {
        return 'BEHANDLINGSDAGER'
    }

    return 'NORMAL'
}
