import { parseAsNumberLiteral, useQueryState, UseQueryStateReturn } from 'nuqs'

export type StepSection = (typeof formSteps)[number]

const formSteps = [1, 2, 3, 4, 5] as const

const stepsParser = parseAsNumberLiteral(formSteps).withDefault(1)

export function useFormStep(): UseQueryStateReturn<
    NonNullable<ReturnType<typeof stepsParser.parse>>,
    typeof stepsParser.defaultValue
> {
    return useQueryState('step', stepsParser)
}
