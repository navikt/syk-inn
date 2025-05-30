import { parseAsArrayOf, parseAsString, useQueryState } from 'nuqs'

export function useAPIOverride(): {
    contextOverrides: string[]
    queryOverrides: string[]
    setContextOverrides: (overrides: string[]) => void
    setQueryOverrides: (overrides: string[]) => void
} {
    const [contextOverrides, setContextOverrides] = useQueryState(
        'context-fails',
        parseAsArrayOf(parseAsString).withDefault([]).withOptions({ clearOnDefault: true }),
    )
    const [queryOverrides, setQueryOverrides] = useQueryState(
        'query-fails',
        parseAsArrayOf(parseAsString).withDefault([]).withOptions({ clearOnDefault: true }),
    )

    return {
        contextOverrides,
        queryOverrides,
        setContextOverrides,
        setQueryOverrides,
    }
}
