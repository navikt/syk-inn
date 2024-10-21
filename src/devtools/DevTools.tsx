'use client'

import React, { MutableRefObject, ReactElement, useCallback, useEffect, useRef, useState } from 'react'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import { SandboxIcon, TenancyIcon } from '@navikt/aksel-icons'
import { Button, Detail } from '@navikt/ds-react'
import { useQueryClient } from '@tanstack/react-query'

import { cn } from '@utils/tw'

import { InternalDevToolsPanel } from './InternalDevTools'

export type DevToolsProps = {
    mode: 'fhir' | 'standalone'
}

function DevTools({ mode }: DevToolsProps): ReactElement {
    const { refs, tanstackOpen, internalOpen, toggleInternalDevTools, toggleTanstackDevTools, closeAllDevTools } =
        useDevToolsOverlayState()

    useKeyboardShortcuts(closeAllDevTools, toggleInternalDevTools, toggleTanstackDevTools)

    return (
        <>
            <div
                className={cn('fixed bottom-2 right-2 flex flex-col gap-2 items-end', {
                    'bottom-[calc(500px+0.5rem)]': tanstackOpen,
                    'right-[calc(500px+0.5rem)]': internalOpen,
                })}
            >
                <div className="text-right text-text-subtle [text-shadow:1px_1px_0px_white]">
                    <div>
                        <Detail className="">Internal devtools</Detail>
                        <Detail className="-mt-1 font-bold">{getAltKeyLabel()} + d</Detail>
                    </div>
                    {process.env.NODE_ENV !== 'production' && (
                        <div>
                            <Detail className="">Query devtools</Detail>
                            <Detail className="-mt-1 font-bold">{getAltKeyLabel()} + t</Detail>
                        </div>
                    )}
                    <div>
                        <Detail className="">Reset query cache</Detail>
                        <Detail className="-mt-1 font-bold">{getAltKeyLabel()} + r</Detail>
                    </div>
                </div>
                <div className="flex items-end">
                    <Button
                        variant="secondary-neutral"
                        size="small"
                        icon={<SandboxIcon title="Lokale utviklingsverktøy" />}
                        className="bg-white"
                        onClick={toggleInternalDevTools}
                    />
                </div>
                {process.env.NODE_ENV !== 'production' && (
                    <div className="flex items-end">
                        <Button
                            variant="secondary-neutral"
                            size="small"
                            icon={<TenancyIcon title="Tanstack Query Devtools" />}
                            className="bg-white"
                            onClick={toggleTanstackDevTools}
                        />
                    </div>
                )}
            </div>
            <dialog ref={refs.tanstackDialogRef} className="fixed bottom-0 left-0 w-full z-popover" open={tanstackOpen}>
                {tanstackOpen && <ReactQueryDevtoolsPanel />}
            </dialog>
            <dialog
                ref={refs.internalDialogRef}
                className="fixed left-auto bottom-0 top-0 right-0 h-full z-popover"
                open={internalOpen}
            >
                {internalOpen && <InternalDevToolsPanel mode={mode} onClose={closeAllDevTools} />}
            </dialog>
        </>
    )
}

function useKeyboardShortcuts(
    closeAllDevTools: () => void,
    toggleInternalDevTools: () => void,
    toggleTanstackDevTools: () => void,
): void {
    const queryClient = useQueryClient()

    useEffect(() => {
        const handleKeydown = (e: KeyboardEvent): void => {
            if (e.key === 'Escape') {
                closeAllDevTools()
            }

            if (e.altKey && e.key === 'd') {
                toggleInternalDevTools()
                e.preventDefault()
            }

            if (e.altKey && e.key === 't') {
                toggleTanstackDevTools()
                e.preventDefault()
            }

            if (e.altKey && e.key === 'r') {
                queryClient.resetQueries()
            }
        }
        document.addEventListener('keydown', handleKeydown)

        return () => {
            document.removeEventListener('keydown', handleKeydown)
        }
    }, [queryClient, closeAllDevTools, toggleInternalDevTools, toggleTanstackDevTools])
}

type UseDevToolsOverlayState = {
    refs: {
        tanstackDialogRef: MutableRefObject<HTMLDialogElement | null>
        internalDialogRef: MutableRefObject<HTMLDialogElement | null>
    }
    tanstackOpen: boolean
    internalOpen: boolean
    toggleInternalDevTools: () => void
    toggleTanstackDevTools: () => void
    closeAllDevTools: () => void
}

function useDevToolsOverlayState(): UseDevToolsOverlayState {
    const tanstackDialogRef = useRef<HTMLDialogElement | null>(null)
    const internalDialogRef = useRef<HTMLDialogElement | null>(null)
    const [tanstackOpen, setTanstackOpen] = useState(localStorage.getItem('tanstackOpen') === 'true')
    const [internalOpen, setInternalOpen] = useState(localStorage.getItem('internalOpen') === 'true')

    const closeAllDevTools = useCallback((): void => {
        setTanstackOpen(false)
        setInternalOpen(false)
        localStorage.removeItem('internalOpen')
        localStorage.removeItem('tanstackOpen')
    }, [])

    const toggleInternalDevTools = useCallback((): void => {
        setTanstackOpen(false)
        setInternalOpen((b) => !b)
        localStorage.setItem('internalOpen', String(!internalOpen))
        localStorage.removeItem('tanstackOpen')

        if (!internalOpen) {
            requestAnimationFrame(() => {
                internalDialogRef.current?.focus()
            })
        }
    }, [internalDialogRef, internalOpen])

    const toggleTanstackDevTools = useCallback((): void => {
        setInternalOpen(false)
        setTanstackOpen((b) => !b)
        localStorage.setItem('tanstackOpen', String(!tanstackOpen))
        localStorage.removeItem('internalOpen')

        if (!tanstackOpen) {
            requestAnimationFrame(() => {
                tanstackDialogRef.current?.focus()
            })
        }
    }, [tanstackDialogRef, tanstackOpen])

    return {
        refs: {
            tanstackDialogRef,
            internalDialogRef,
        },
        tanstackOpen,
        internalOpen,
        toggleInternalDevTools,
        toggleTanstackDevTools,
        closeAllDevTools,
    }
}

const getAltKeyLabel = (): string => {
    return /Mac/i.test(navigator.platform) ? '⌥' : 'alt'
}

export default DevTools
