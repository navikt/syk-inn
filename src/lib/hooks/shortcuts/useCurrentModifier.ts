import { useEffect, useState } from 'react'

/**
 * Returns the currently held modifier key, live updates as the user holds the key.
 */
export function useCurrentModifier(): 'alt' | 'shift' | 'ctrl' | null {
    const [modifier, setModifier] = useState<'alt' | 'shift' | 'ctrl' | null>(null)

    useEffect(() => {
        const down = (e: KeyboardEvent): void => {
            if (e.altKey) setModifier('alt')
            else if (e.shiftKey) setModifier('shift')
            else if (e.ctrlKey) setModifier('ctrl')
        }

        const up = (): void => {
            setModifier(null)
        }

        window.addEventListener('keydown', down)
        window.addEventListener('keyup', up)
        window.addEventListener('blur', up)

        return () => {
            window.removeEventListener('keydown', down)
            window.removeEventListener('keyup', up)
            window.removeEventListener('blur', up)
        }
    }, [])

    return modifier
}
