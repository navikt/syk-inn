import { Detail } from '@navikt/ds-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { PropsWithChildren, ReactElement } from 'react'

import DemoWarning from '#components/user-warnings/DemoWarning'
import { isDemo, isLocal } from '#lib/env'

import { getDemoFrameEnabled } from './cookies'
import FakeEpjHeader from './FakeEpjHeader'
import FakeEpjSidebar from './FakeEpjSidebar'
import logo from './nav-logo.svg'

async function DemoFrame({ children }: PropsWithChildren): Promise<ReactElement> {
    if (!isDemo && !isLocal) return <>{children}</>

    const useDemoFrame = await getDemoFrameEnabled()
    if (!useDemoFrame) {
        return (
            <>
                <DemoWarning />
                {children}
            </>
        )
    }

    return (
        <div>
            <div className="grid h-screen w-screen grid-cols-[16rem_1fr] grid-rows-[auto_1fr] overflow-hidden bg-ax-bg-neutral-soft">
                <header className="col-span-2 flex items-center gap-4 border-b border-ax-border-brand-magenta-subtle bg-ax-bg-brand-magenta-soft px-4 py-2">
                    <div className="flex shrink-0 items-center gap-3">
                        <Link href="/dev">
                            <Image src={logo} alt="NAV logo" className="h-14 w-22 rotate-180 hue-rotate-120" />
                        </Link>

                        <div className="shrink-0 leading-tight">
                            <div className="shrink-0 font-ax-bold text-ax-text-brand-magenta text-2xl">
                                Journalsystem
                            </div>
                            <Detail className="text-ax-text-brand-magenta-subtle">Elektronisk pasientjournal</Detail>
                        </div>
                    </div>
                    <FakeEpjHeader />
                </header>

                <aside className="row-start-2 overflow-auto border-r border-ax-border-brand-magenta-subtle bg-ax-bg-brand-magenta-soft p-4">
                    <FakeEpjSidebar />
                </aside>
                <main className="relative row-start-2 min-h-0 min-w-0 overflow-auto isolate @container-size">
                    {children}
                </main>
            </div>
        </div>
    )
}

export default DemoFrame
