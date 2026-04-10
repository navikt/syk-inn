import React, { ReactElement } from 'react'
import { useQuery } from '@apollo/client/react'
import { BodyShort, Skeleton } from '@navikt/ds-react'
import { PieChart } from 'react-minimal-pie-chart'

import { AllDashboardDocument, GetAllDraftsDocument } from '@queries'
import { useFlag } from '@core/toggles/context'
import { cn } from '@lib/tw'

import { continiousSykefravaer } from './sykefravaer-utils'

function PatientStats({ className }: { className?: string }): ReactElement {
    const allDrafts = useQuery(GetAllDraftsDocument)
    const sykmeldinger = useQuery(AllDashboardDocument)

    const sykefravaerInfoToggle = useFlag('SYK_INN_SYKEFRAVAER_INFO')

    if (allDrafts.loading || sykmeldinger.loading) {
        return (
            <div className={cn(className, 'flex gap-6 items-center justify-center sm:justify-start')}>
                {sykefravaerInfoToggle && (
                    <div className="flex items-center size-48 md:size-36 ax-lg:size-48">
                        <Skeleton variant="circle" className="w-full h-full" />
                    </div>
                )}
                <Skeleton variant="rounded" className="size-50 h-full max-h-58" />
            </div>
        )
    }

    const current = sykmeldinger.data?.sykmeldinger?.current ?? []
    const previous = sykmeldinger.data?.sykmeldinger?.historical ?? []
    const days = continiousSykefravaer([...current, ...previous])

    return (
        <div className={cn(className, 'flex gap-6 items-center justify-center md:justify-start')}>
            {sykefravaerInfoToggle && (
                <div className="flex items-center relative size-48 md:size-36 ax-lg:size-48">
                    <PieChart
                        lineWidth={26}
                        startAngle={270}
                        data={[
                            { title: 'One', value: (days / 365) * 100, color: 'var(--ax-success-600)' },
                            { title: 'Two', value: ((365 - days) / 365) * 100, color: 'var(--ax-success-300)' },
                        ]}
                    />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                        <BodyShort size="small" className="text-nowrap text-base md:text-xs ax-lg:text-base">
                            Påløpt sykefravær
                        </BodyShort>
                        <BodyShort className="text-base md:text-xs ax-lg:text-base">
                            {(days / 7).toFixed(0)} av 52 uker
                        </BodyShort>
                    </div>
                </div>
            )}
            <div className="flex flex-col justify-between shadow-md p-4 max-h-58 h-full rounded-md">
                <div className="flex gap-2 items-center">
                    <div className="text-4xl">{allDrafts.data?.drafts?.length ?? 0}</div>
                    <div className="text-center text-sm w-full">utkast</div>
                </div>
                <div className="flex gap-2 items-center">
                    <div className="text-4xl">{current.length}</div>
                    <div className="text-center text-sm w-full">pågående sykmeldinger</div>
                </div>
                <div className="flex gap-2 items-center">
                    <div className="text-4xl">{previous.length}</div>
                    <div className="text-center text-sm w-full">tidligere sykmeldinger</div>
                </div>
            </div>
        </div>
    )
}

export default PatientStats
