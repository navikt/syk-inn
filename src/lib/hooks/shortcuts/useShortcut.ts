import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

export type Shortcut = {
    modifier: 'alt' | 'shift'
    code: 'KeyN' | 'KeyS' | 'KeyD' | 'ArrowLeft' | 'ArrowRight'
}

type RegisteredShortcut = {
    label: string
}

export function useShortcut(key: Shortcut, onShortcut: () => void, inactive?: boolean): RegisteredShortcut {
    const { current: stableKey } = useRef(key)

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent): void => {
            if (inactive === true) return

            const modifier = stableKey.modifier === 'alt' ? event.altKey : event.shiftKey

            if (modifier && event.code === stableKey.code) {
                event.preventDefault()

                toast(
                    `Snarvei ${getOsAgnosticModifierLabel(stableKey.modifier)} + ${getKeyLabel(stableKey.code)} aktivert`,
                    { duration: 1000, position: 'top-right' },
                )
                onShortcut()
            }
        }

        window.addEventListener('keydown', handleKeyDown)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [inactive, onShortcut, stableKey.code, stableKey.modifier])

    return {
        label: `${getOsAgnosticModifierLabel(stableKey.modifier)} + ${getKeyLabel(stableKey.code)}`,
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

function getKeyLabel(code: Shortcut['code']): string {
    switch (code) {
        case 'KeyN':
            return 'N'
        case 'KeyS':
            return 'S'
        case 'KeyD':
            return 'D'
        case 'ArrowLeft':
            return '←'
        case 'ArrowRight':
            return '→'
    }
}
