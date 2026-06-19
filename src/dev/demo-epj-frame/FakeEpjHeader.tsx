import { CalendarIcon, ChevronDownIcon, PersonPlusIcon, PrinterSmallIcon, StethoscopeIcon } from '@navikt/aksel-icons'
import { BodyShort, Detail } from '@navikt/ds-react'
import React, { ReactElement } from 'react'

import { cn } from '#lib/tw'

const FAKE_BEHANDLER = {
    navn: 'Magnar Koman',
    hpr: '9144889',
} as const

function FakeEpjHeader(): ReactElement {
    return (
        <div className="flex grow items-center gap-3 select-none">
            <div className="flex items-center gap-2">
                <FakeButton variant="primary" icon={<StethoscopeIcon aria-hidden />} chevron className="hidden sm:flex">
                    Ny konsultasjon
                </FakeButton>
                <FakeButton className="hidden lg:flex" icon={<PersonPlusIcon aria-hidden />}>
                    Ny pasient
                </FakeButton>
                <FakeButton chevron className="hidden lg:flex">
                    Mer
                </FakeButton>
            </div>
            <div className="ml-auto flex items-center gap-3">
                <FakeIconButton label="Timebok" badge="3" className="hidden md:flex">
                    <CalendarIcon aria-hidden fontSize="1.5rem" />
                </FakeIconButton>
                <FakeIconButton label="Utskrift" className="hidden md:flex">
                    <PrinterSmallIcon aria-hidden fontSize="1.5rem" />
                </FakeIconButton>
                <div className="mx-1 h-8 w-px bg-ax-border-brand-magenta-subtle" aria-hidden />
                <FakeBehandler />
            </div>
        </div>
    )
}

function FakeButton({
    children,
    icon,
    chevron,
    className,
    variant = 'neutral',
}: {
    children: React.ReactNode
    icon?: ReactElement
    chevron?: boolean
    className?: string
    variant?: 'primary' | 'neutral'
}): ReactElement {
    return (
        <span
            aria-hidden
            className={cn(
                'flex shrink-0 h-8 cursor-pointer items-center gap-1.5 rounded-md px-3 text-sm font-ax-bold transition-colors',
                className,
                {
                    'bg-ax-bg-brand-magenta-strong text-ax-text-brand-magenta-contrast hover:bg-ax-bg-brand-magenta-strong-hover':
                        variant === 'primary',
                    'text-ax-text-brand-magenta hover:bg-ax-bg-brand-magenta-moderate-hover': variant === 'neutral',
                },
            )}
        >
            {icon}
            {children}
            {chevron && <ChevronDownIcon aria-hidden />}
        </span>
    )
}

function FakeIconButton({
    children,
    label,
    className,
    badge,
}: {
    children: React.ReactNode
    label: string
    className?: string
    badge?: string
}): ReactElement {
    return (
        <span
            aria-hidden
            title={label}
            className={cn(
                'relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-ax-text-brand-magenta transition-colors hover:bg-ax-bg-brand-magenta-moderate-hover',
                className,
            )}
        >
            {children}
            {badge != null && (
                <span className="absolute -top-0.5 -right-0.5 flex min-w-4 items-center justify-center rounded-full bg-ax-bg-danger-strong px-1 text-[0.625rem] leading-none font-ax-bold text-ax-text-danger-contrast">
                    {badge}
                </span>
            )}
        </span>
    )
}

function FakeBehandler(): ReactElement {
    const { navn, hpr } = FAKE_BEHANDLER

    return (
        <div className="flex cursor-pointer items-center gap-2">
            <Avatar navn={navn} />
            <div className="hidden flex-col leading-tight sm:flex">
                <BodyShort size="small" className="font-ax-bold text-ax-text-brand-magenta">
                    {navn}
                </BodyShort>
                <Detail className="text-ax-text-brand-magenta-subtle">HPR {hpr}</Detail>
            </div>
            <ChevronDownIcon aria-hidden className="text-ax-text-brand-magenta-subtle" />
        </div>
    )
}

function Avatar({ navn }: { navn: string }): ReactElement {
    const initials = navn
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('')

    return (
        <span
            aria-hidden
            className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                'bg-ax-bg-brand-magenta-strong text-sm font-ax-bold text-ax-text-brand-magenta-contrast',
            )}
        >
            {initials || '–'}
        </span>
    )
}

export default FakeEpjHeader
