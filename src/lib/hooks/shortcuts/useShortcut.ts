import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

export type Shortcut = {
    modifier: 'alt' | 'shift'
    key: string
}

type RegisteredShortcut = {
    label: string
}

export function useShortcut(key: Shortcut, onShortcut: () => void): RegisteredShortcut {
    const { current: stableKey } = useRef(key)

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent): void => {
            const modifier = stableKey.modifier === 'alt' ? event.altKey : event.shiftKey

            if (modifier && event.key.toLowerCase() === stableKey.key.toLowerCase()) {
                event.preventDefault()

                toast(
                    `Snarvei ${getOsAgnosticModifierLabel(stableKey.modifier)} + ${getKeyLabel(stableKey.key)} aktivert`,
                    { duration: 1000, position: 'top-right' },
                )
                onShortcut()
            }
        }

        window.addEventListener('keydown', handleKeyDown)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [onShortcut, stableKey.key, stableKey.modifier])

    return {
        label: `${getOsAgnosticModifierLabel(stableKey.modifier)} + ${getKeyLabel(stableKey.key)}`,
    }
}

function getOsAgnosticModifierLabel(key: Shortcut['modifier']): string {
    switch (key) {
        case 'alt': {
            return /Mac/i.test(navigator.platform) ? '⌥' : 'alt'
        }
        case 'shift': {
            return '⇧'
        }
    }
}

function getKeyLabel(key: string): string {
    switch (key) {
        case 'arrowleft': {
            return '←'
        }
        case 'arrowright': {
            return '→'
        }
        default:
            return key.toUpperCase()
    }
}
