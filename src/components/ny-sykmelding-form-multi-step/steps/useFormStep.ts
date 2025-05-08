import { parseAsNumberLiteral, useQueryState, UseQueryStateReturn } from 'nuqs'

export type StepSection = (typeof formSteps)[number]

export const formSteps = [1, 2, 3] as const

const stepsParser = parseAsNumberLiteral(formSteps).withDefault(1).withOptions({
    history: 'push',
})

export function useFormStep(): UseQueryStateReturn<
    NonNullable<ReturnType<typeof stepsParser.parse>>,
    typeof stepsParser.defaultValue
> {
    return useQueryState('step', stepsParser)
}
