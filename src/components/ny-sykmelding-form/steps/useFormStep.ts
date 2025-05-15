import { useQueryState, UseQueryStateReturn, parseAsStringLiteral } from 'nuqs'

export const formSteps = ['main', 'summary'] as const

export type StepSection = (typeof formSteps)[number]

const stepsParser = parseAsStringLiteral(formSteps).withDefault('main').withOptions({
    history: 'push',
})

export function useFormStep(): UseQueryStateReturn<
    NonNullable<ReturnType<typeof stepsParser.parse>>,
    typeof stepsParser.defaultValue
> {
    return useQueryState('step', stepsParser)
}
