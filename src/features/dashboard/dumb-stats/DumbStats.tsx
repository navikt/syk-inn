import React, { ReactElement } from 'react'
import { useQuery } from '@apollo/client/react'
import { BodyShort, Skeleton } from '@navikt/ds-react'
import { PieChart } from 'react-minimal-pie-chart'

import { AllSykmeldingerDocument, GetAllDraftsDocument } from '@queries'
import { useFlag } from '@core/toggles/context'

import { continiousSykefravaer } from './sykefravaer-utils'

function DumbStats(): ReactElement {
    const allDrafts = useQuery(GetAllDraftsDocument)
    const sykmeldinger = useQuery(AllSykmeldingerDocument)

    const sykefravaerInfoToggle = useFlag('SYK_INN_SYKEFRAVAER_INFO')

    if (allDrafts.loading || sykmeldinger.loading) {
        return (
            <div className="mb-2 flex gap-12 -mt-2">
                {sykefravaerInfoToggle && (
                    <div className="flex items-center">
                        <Skeleton variant="circle" className="size-48" />
                    </div>
                )}
                <Skeleton variant="rounded" className="w-50 h-full" />
            </div>
        )
    }

    const current = sykmeldinger.data?.sykmeldinger?.current ?? []
    const previous = sykmeldinger.data?.sykmeldinger?.historical ?? []
    const days = continiousSykefravaer([...current, ...previous])

    return (
        <div className="-mt-2 mb-2 flex gap-12">
            {sykefravaerInfoToggle && (
                <div className="flex items-center relative">
                    <PieChart
                        className="size-48"
                        lineWidth={26}
                        startAngle={270}
                        data={[
                            { title: 'One', value: (days / 365) * 100, color: 'var(--a-green-500)' },
                            { title: 'Two', value: ((365 - days) / 365) * 100, color: 'var(--a-green-200)' },
                        ]}
                    />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                        <BodyShort size="small" className="text-nowrap">
                            Påløpt sykefravær
                        </BodyShort>
                        <BodyShort>{(days / 7).toFixed(0)} av 52 uker</BodyShort>
                    </div>
                </div>
            )}
            <div className="flex flex-col justify-between shadow-md p-4 h-full rounded-md">
                <div className="flex gap-2 items-center">
                    <div className="text-4xl">{allDrafts.data?.drafts?.length ?? 0}</div>
                    <div className="text-center text-sm">utkast</div>
                </div>
                <div className=" flex gap-2 items-center">
                    <div className="text-4xl">{current.length}</div>
                    <div className="text-center text-sm">pågående sykmeldinger</div>
                </div>
                <div className=" flex gap-2 items-center">
                    <div className="text-4xl">{previous.length}</div>
                    <div className="text-center text-sm">tidligere sykmeldinger</div>
                </div>
            </div>
        </div>
    )
}

export default DumbStats
