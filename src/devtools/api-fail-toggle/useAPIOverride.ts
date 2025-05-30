import { parseAsArrayOf, parseAsString, useQueryState } from 'nuqs'

export function useAPIOverride(): {
    queryOverrides: string[]
    setQueryOverrides: (overrides: string[]) => void
} {
    const [queryOverrides, setQueryOverrides] = useQueryState(
        'query-fails',
        parseAsArrayOf(parseAsString).withDefault([]).withOptions({ clearOnDefault: true }),
    )

    return {
        queryOverrides,
        setQueryOverrides,
    }
}
