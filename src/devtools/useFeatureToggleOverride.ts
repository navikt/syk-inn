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
     * Overriden toggles compared to the hardcoded values
     */
    overriddenToggles: string[]
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
                localToggle: it.enabled,
            })),
        [],
    )

    const [overriddenToggles, setOverriddenToggles] = useState<string[]>(
        toggles.filter((it) => getOverrideStatus(it.name) != null).map((it) => it.name),
    )
    const [toggledToggles, setInternalToggleState] = useState<string[]>(
        toggles.filter((it) => it.enabled).map((it) => it.name),
    )

    const setToggledToggles = useCallback(
        (value: string[]) => {
            const togglesToEnable = toggles.filter((it) => value.includes(it.name))
            const togglesToDisable = toggles.filter((it) => !value.includes(it.name))

            const actuallyOverriddenToggles: string[] = []
            togglesToEnable.forEach((it) => {
                // If hardcoded is true, just wipe the cookie, else set it to true to override
                if (!it.localToggle) {
                    document.cookie = `${it.name}=true; path=/`
                    actuallyOverriddenToggles.push(it.name)
                    return
                } else {
                    document.cookie = `${it.name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
                    return
                }
            })
            togglesToDisable.forEach((it) => {
                // If hardcoded is false, just wipe the cookie, else set it to false to override
                if (it.localToggle) {
                    document.cookie = `${it.name}=false; path=/`
                    actuallyOverriddenToggles.push(it.name)
                    return
                } else {
                    // It matches the hardcoded status, so we remove the cookie
                    document.cookie = `${it.name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
                    return
                }
            })

            setInternalToggleState(value)
            setOverriddenToggles(actuallyOverriddenToggles)
        },
        [toggles],
    )

    const resetOverrides = useCallback(() => {
        toggles.forEach((it) => {
            document.cookie = `${it.name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
        })

        setInternalToggleState(localDevelopmentToggles.filter((it) => it.enabled).map((it) => it.name))
        setOverriddenToggles([])
    }, [toggles])

    return {
        toggles,
        toggledToggles: toggledToggles,
        setToggledToggles: setToggledToggles,
        overriddenToggles: overriddenToggles,
        resetOverrides,
    }
}

function getOverrideStatus(key: string): boolean | null {
    const currentCookieValue = document.cookie.split(';').find((cookie) => cookie.includes(key))

    if (currentCookieValue == null) {
        return null
    }

    return currentCookieValue.includes('true')
}
