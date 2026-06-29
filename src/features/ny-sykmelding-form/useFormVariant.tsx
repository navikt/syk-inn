import { useQueryState, parseAsStringLiteral } from 'nuqs'

import { SykmeldingFragment } from '#queries'

export const FORM_VARIANT_KEY = 'variant'

const variants = ['NORMAL', 'BEHANDLINGSDAGER', 'REISETILSKUDD'] as const

export type NySykmeldingFormVariantType = (typeof variants)[number]

export function useFormVariant(): NySykmeldingFormVariantType {
    const [variant] = useQueryState(FORM_VARIANT_KEY, parseAsStringLiteral(variants))

    return variant ?? 'NORMAL'
}

export function inferSykmeldingType(sykmelding: SykmeldingFragment): NySykmeldingFormVariantType {
    const firstPeriod = sykmelding.values.aktivitet[0]
    if (firstPeriod.type === 'BEHANDLINGSDAGER') {
        return 'BEHANDLINGSDAGER'
    } else if (firstPeriod.type === 'REISETILSKUDD') {
        return 'REISETILSKUDD'
    } else if (firstPeriod.__typename === 'Gradert' && firstPeriod.reisetilskudd) {
        return 'REISETILSKUDD'
    }

    return 'NORMAL'
}
