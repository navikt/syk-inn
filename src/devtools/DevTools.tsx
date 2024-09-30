'use client'

import React, { ReactElement, useState } from 'react'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import { SandboxIcon, TenancyIcon } from '@navikt/aksel-icons'
import { Button } from '@navikt/ds-react'

import { cn } from '@utils/tw'
import { InternalDevToolsPanel } from '@/devtools/InternalDevTools'

function DevTools(): ReactElement {
    const [tanstackOpen, setTanstackOpen] = useState(false)
    const [internalOpen, setInternalOpen] = useState(false)

    return (
        <>
            {tanstackOpen && (
                <div className="fixed bottom-0 left-0 w-full">
                    <ReactQueryDevtoolsPanel />
                </div>
            )}
            {internalOpen && (
                <div className="fixed bottom-0 left-0 w-full">
                    <InternalDevToolsPanel />
                </div>
            )}
            <div
                className={cn('fixed bottom-2 right-2 flex flex-col gap-2', {
                    'bottom-[calc(500px+0.5rem)]': tanstackOpen || internalOpen,
                })}
            >
                <Button
                    variant="secondary-neutral"
                    size="small"
                    icon={<SandboxIcon title="Lokale utviklingsverktøy" />}
                    className="bg-white"
                    onClick={() => {
                        setTanstackOpen(false)
                        setInternalOpen((b) => !b)
                    }}
                />
                <Button
                    variant="secondary-neutral"
                    size="small"
                    icon={<TenancyIcon title="Tanstack Query Devtools" />}
                    className="bg-white"
                    onClick={() => {
                        setInternalOpen(false)
                        setTanstackOpen((b) => !b)
                    }}
                />
            </div>
        </>
    )
}

export default DevTools
