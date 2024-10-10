'use client'

import React, { ReactElement, useCallback, useEffect, useState } from 'react'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import { SandboxIcon, TenancyIcon } from '@navikt/aksel-icons'
import { Button, Detail } from '@navikt/ds-react'

import { cn } from '@utils/tw'

import { InternalDevToolsPanel } from './InternalDevTools'

export type DevToolsProps = {
    mode: 'fhir' | 'standalone'
}

function DevTools({ mode }: DevToolsProps): ReactElement {
    const tanstackDialogRef = React.useRef<HTMLDialogElement | null>(null)
    const internalDialogRef = React.useRef<HTMLDialogElement | null>(null)
    const [tanstackOpen, setTanstackOpen] = useState(localStorage.getItem('tanstackOpen') === 'true')
    const [internalOpen, setInternalOpen] = useState(localStorage.getItem('internalOpen') === 'true')

    const closeAllDevTools = (): void => {
        setTanstackOpen(false)
        setInternalOpen(false)
        localStorage.removeItem('internalOpen')
        localStorage.removeItem('tanstackOpen')
    }

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
        }
        document.addEventListener('keydown', handleKeydown)

        return () => {
            document.removeEventListener('keydown', handleKeydown)
        }
    }, [toggleInternalDevTools, toggleTanstackDevTools])

    return (
        <>
            <div
                className={cn('fixed bottom-2 right-2 flex flex-col gap-2 items-end', {
                    'bottom-[calc(500px+0.5rem)]': tanstackOpen || internalOpen,
                })}
            >
                <div className="flex items-end">
                    <Detail className="text-sm text-text-subtle mr-1">{getAltKeyLabel()} + d</Detail>
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
                        <Detail className="text-sm text-text-subtle mr-1">{getAltKeyLabel()} + t</Detail>
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
            <dialog ref={tanstackDialogRef} className="fixed bottom-0 left-0 w-full z-popover" open={tanstackOpen}>
                {tanstackOpen && <ReactQueryDevtoolsPanel />}
            </dialog>
            <dialog ref={internalDialogRef} className="fixed bottom-0 left-0 w-full z-popover" open={internalOpen}>
                {internalOpen && <InternalDevToolsPanel mode={mode} onClose={closeAllDevTools} />}
            </dialog>
        </>
    )
}

const getAltKeyLabel = (): string => {
    return /Mac/i.test(navigator.platform) ? '⌥' : 'alt'
}

export default DevTools
