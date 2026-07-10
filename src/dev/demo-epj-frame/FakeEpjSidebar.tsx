import {
    AllergensIcon,
    BandageIcon,
    CalendarIcon,
    ClipboardIcon,
    FileTextIcon,
    FirstAidIcon,
    FolderIcon,
    HeartIcon,
    HouseHeartIcon,
    ImageIcon,
    InboxIcon,
    MagnifyingGlassIcon,
    NewspaperIcon,
    NotePencilIcon,
    ReceiptIcon,
    StethoscopeIcon,
    TasklistIcon,
    ThermometerIcon,
    WheelchairIcon,
} from '@navikt/aksel-icons'
import { Detail, LocalAlert } from '@navikt/ds-react'
import { LocalAlertContent, LocalAlertHeader, LocalAlertTitle } from '@navikt/ds-react/LocalAlert'
import React, { ReactElement } from 'react'

import { cn } from '#lib/tw'

type FakeNavItem = {
    label: string
    Icon: typeof FileTextIcon
    badge?: string
    active?: boolean
}

type FakeNavGroup = {
    heading: string
    items: FakeNavItem[]
}

const NAV_GROUPS: FakeNavGroup[] = [
    {
        heading: 'Pasient',
        items: [
            { label: 'Pasientoversikt', Icon: HouseHeartIcon },
            { label: 'Løpende journal', Icon: FileTextIcon },
            { label: 'Kjernejournal', Icon: HeartIcon },
            { label: 'Kritisk informasjon', Icon: AllergensIcon, badge: '2' },
            { label: 'Diagnoser og problemstillinger', Icon: ClipboardIcon },
        ],
    },
    {
        heading: 'Klinisk',
        items: [
            { label: 'Legemidler i bruk', Icon: FirstAidIcon },
            { label: 'Resepter (e-resept)', Icon: ReceiptIcon },
            { label: 'Målinger og observasjoner', Icon: ThermometerIcon },
            { label: 'Laboratoriesvar', Icon: StethoscopeIcon, badge: '5' },
            { label: 'Radiologi og bilder', Icon: ImageIcon },
            { label: 'Sår og prosedyrer', Icon: BandageIcon },
        ],
    },
    {
        heading: 'Oppfølging',
        items: [
            { label: 'Henvisninger', Icon: NotePencilIcon },
            { label: 'Timeavtaler', Icon: CalendarIcon },
            { label: 'Rehabilitering og hjelpemidler', Icon: WheelchairIcon },
            { label: 'Sykmeldinger', Icon: FolderIcon, badge: 'Ny', active: true },
        ],
    },
    {
        heading: 'Arbeidsflyt',
        items: [
            { label: 'Innkurv', Icon: InboxIcon, badge: '12' },
            { label: 'Oppgaver', Icon: TasklistIcon },
            { label: 'Meldinger (PLO)', Icon: NewspaperIcon },
        ],
    },
]

export function FakeEpjSidebar(): ReactElement {
    return (
        <nav aria-hidden className="flex select-none flex-col gap-5">
            <FakeSearch />
            <LocalAlert status="warning" size="small">
                <LocalAlertHeader>
                    <LocalAlertTitle>Demoside for test</LocalAlertTitle>
                </LocalAlertHeader>
                <LocalAlertContent>Uten ekte data</LocalAlertContent>
            </LocalAlert>
            {NAV_GROUPS.map((group) => (
                <div key={group.heading}>
                    <Detail as="div" uppercase className="px-2 pb-1 font-ax-bold text-ax-text-brand-magenta-subtle">
                        {group.heading}
                    </Detail>
                    <ul className="flex flex-col gap-0.5">
                        {group.items.map((item) => (
                            <FakeNavRow key={item.label} item={item} />
                        ))}
                    </ul>
                </div>
            ))}
        </nav>
    )
}

function FakeSearch(): ReactElement {
    return (
        <div className="flex items-center gap-2 rounded-md border border-ax-border-brand-magenta-subtle bg-ax-bg-brand-magenta-moderate px-2.5 py-2 text-ax-text-brand-magenta-subtle">
            <MagnifyingGlassIcon aria-hidden fontSize="1.25rem" className="shrink-0" />
            <span className="truncate text-sm">Søk i journal …</span>
        </div>
    )
}

function FakeNavRow({ item }: { item: FakeNavItem }): ReactElement {
    const { label, Icon, badge, active } = item

    return (
        <li
            className={cn(
                'flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors',
                'hover:bg-ax-bg-brand-magenta-moderate-hover',
                {
                    'bg-ax-bg-brand-magenta-moderate font-ax-bold text-ax-text-brand-magenta hover:bg-ax-bg-brand-magenta-moderate':
                        active,
                    'text-ax-text-brand-magenta': !active,
                },
            )}
        >
            <Icon aria-hidden fontSize="1.25rem" className="shrink-0" />
            <span className="grow truncate">{label}</span>
            {badge != null && (
                <span
                    className={cn(
                        'shrink-0 rounded-full px-1.5 py-0.5 text-xs font-ax-bold leading-none',
                        active
                            ? 'bg-ax-bg-brand-magenta-strong text-ax-text-brand-magenta-contrast'
                            : 'bg-ax-bg-brand-magenta-moderate text-ax-text-brand-magenta-subtle',
                    )}
                >
                    {badge}
                </span>
            )}
        </li>
    )
}
