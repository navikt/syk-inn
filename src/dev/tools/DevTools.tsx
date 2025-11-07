'use client'

import React, { RefObject, ReactElement, useCallback, useEffect, useRef, useState } from 'react'
import { SandboxIcon } from '@navikt/aksel-icons'
import { Button, Detail } from '@navikt/ds-react'
import { useApolloClient } from '@apollo/client/react'

import { cn } from '@lib/tw'

import { InternalDevToolsPanel } from './InternalDevTools'

function DevTools(): ReactElement {
    const { refs, internalOpen, toggleInternalDevTools, closeAllDevTools } = useDevToolsOverlayState()

    useKeyboardShortcuts(closeAllDevTools, toggleInternalDevTools)

    return (
        <>
            <div
                className={cn('fixed bottom-2 right-2 flex flex-col gap-2 items-end z-[100000] pointer-events-none', {
                    'right-[calc(500px+0.5rem)]': internalOpen,
                })}
            >
                <div className="text-right text-text-subtle [text-shadow:1px_1px_0px_white]">
                    <div>
                        <Detail className="">Internal devtools</Detail>
                        <Detail className="-mt-1 font-bold">{getAltKeyLabel()} + l</Detail>
                    </div>
                    <div>
                        <Detail className="">Reset query cache</Detail>
                        <Detail className="-mt-1 font-bold">{getAltKeyLabel()} + r</Detail>
                    </div>
                </div>
                <div className="flex items-end pointer-events-auto">
                    <Button
                        variant="secondary-neutral"
                        size="small"
                        icon={<SandboxIcon title="Lokale utviklingsverktøy" />}
                        className="bg-white"
                        onClick={toggleInternalDevTools}
                    />
                </div>
            </div>
            <dialog
                ref={refs.internalDialogRef}
                className="fixed left-auto bottom-0 top-0 right-0 h-full z-popover"
                open={internalOpen}
            >
                {internalOpen && <InternalDevToolsPanel onClose={closeAllDevTools} />}
            </dialog>
        </>
    )
}

function useKeyboardShortcuts(closeAllDevTools: () => void, toggleInternalDevTools: () => void): void {
    const client = useApolloClient()

    useEffect(() => {
        const handleKeydown = (e: KeyboardEvent): void => {
            if (e.key === 'Escape') {
                closeAllDevTools()
            }

            if (e.altKey && e.key === 'l') {
                toggleInternalDevTools()
                e.preventDefault()
            }

            if (e.altKey && e.key === 'r') {
                client.resetStore()
            }
        }
        document.addEventListener('keydown', handleKeydown)

        return () => {
            document.removeEventListener('keydown', handleKeydown)
        }
    }, [client, closeAllDevTools, toggleInternalDevTools])
}

type UseDevToolsOverlayState = {
    refs: {
        internalDialogRef: RefObject<HTMLDialogElement | null>
    }
    internalOpen: boolean
    toggleInternalDevTools: () => void
    closeAllDevTools: () => void
}

function useDevToolsOverlayState(): UseDevToolsOverlayState {
    const internalDialogRef = useRef<HTMLDialogElement | null>(null)
    const [internalOpen, setInternalOpen] = useState(localStorage.getItem('internalOpen') === 'true')

    const closeAllDevTools = useCallback((): void => {
        setInternalOpen(false)
        localStorage.removeItem('internalOpen')
    }, [])

    const toggleInternalDevTools = useCallback((): void => {
        setInternalOpen((b) => !b)
        localStorage.setItem('internalOpen', String(!internalOpen))

        if (!internalOpen) {
            requestAnimationFrame(() => {
                internalDialogRef.current?.focus()
            })
        }
    }, [internalDialogRef, internalOpen])

    return {
        refs: {
            internalDialogRef,
        },
        internalOpen,
        toggleInternalDevTools,
        closeAllDevTools,
    }
}

const getAltKeyLabel = (): string => {
    return /Mac/i.test(navigator.platform) ? '⌥' : 'alt'
}

export default DevTools
