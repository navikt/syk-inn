import { useCallback, useMemo, useState } from 'react'

import { localDevelopmentToggles } from '@toggles/dev/local'

type UseFeatureToggleOverride = {
    /**
     * All available toggles
     */
    toggles: { name: string; enabled: boolean }[]
    /**
     * Currently selected toggles state
     */
    toggledToggles: string[]
    /**
     * Set toggles state and update cookies
     */
    setToggledToggles: (value: string[]) => void
    /**
     * Reset all overrides back to default
     */
    resetOverrides: () => void
}

export function useFeatureToggleOverride(): UseFeatureToggleOverride {
    const toggles = useMemo(
        () =>
            localDevelopmentToggles.map((it) => ({
                name: it.name,
                enabled: getOverrideStatus(it.name) ?? it.enabled,
            })),
        [],
    )

    const [toggledToggles, setInternalToggleState] = useState<string[]>(
        toggles.filter((it) => it.enabled).map((it) => it.name),
    )

    const setToggledToggles = useCallback(
        (value: string[]) => {
            const togglesToEnable = toggles.filter((it) => value.includes(it.name))
            const togglesToDisable = toggles.filter((it) => !value.includes(it.name))

            togglesToEnable.forEach((it) => {
                document.cookie = `${it.name}=true; path=/`
            })
            togglesToDisable.forEach((it) => {
                document.cookie = `${it.name}=false; path=/`
            })

            setInternalToggleState(value)
        },
        [toggles],
    )

    const resetOverrides = useCallback(() => {
        toggles.forEach((it) => {
            document.cookie = `${it.name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
        })

        setInternalToggleState(localDevelopmentToggles.filter((it) => it.enabled).map((it) => it.name))
    }, [toggles])

    return { toggles, toggledToggles: toggledToggles, setToggledToggles: setToggledToggles, resetOverrides }
}

function getOverrideStatus(key: string): boolean | null {
    const currentCookieValue = document.cookie.split(';').find((cookie) => cookie.includes(key))

    if (currentCookieValue == null) {
        return null
    }

    return currentCookieValue.includes('true')
}
