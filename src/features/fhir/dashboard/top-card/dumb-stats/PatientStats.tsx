import { useQuery } from '@apollo/client/react'
import { BandageIcon, ClockDashedIcon, HourglassTopFilledIcon, NotePencilDashIcon } from '@navikt/aksel-icons'
import { Skeleton } from '@navikt/ds-react'
import React, { ReactElement } from 'react'

import { useFlag } from '#core/toggles/context'
import { AllDashboardDocument, GetAllDraftsDocument } from '#queries'

import { continiousSykefravaer } from './sykefravaer-utils'

export function PatientStats(): ReactElement {
    const allDrafts = useQuery(GetAllDraftsDocument)
    const sykmeldinger = useQuery(AllDashboardDocument)

    const sykefravaerInfoToggle = useFlag('SYK_INN_SYKEFRAVAER_INFO')

    if (allDrafts.loading || sykmeldinger.loading) {
        return (
            <div className="mt-4">
                <div className="flex gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                        <Skeleton variant="circle" className="size-12 shrink-0" />
                        <Skeleton variant="rectangle" className="size-6 shrink-0 mx-2" />
                        <Skeleton variant="rectangle" width={200} className="max-w-30 grow" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton variant="circle" className="size-12 shrink-0" />
                        <Skeleton variant="rectangle" className="size-6 shrink-0 mx-2" />
                        <Skeleton variant="rectangle" width={200} className="max-w-30 grow" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton variant="circle" className="size-12 shrink-0" />
                        <Skeleton variant="rectangle" className="size-6 shrink-0 mx-2" />
                        <Skeleton variant="rectangle" width={200} className="max-w-30 grow" />
                    </div>
                </div>
            </div>
        )
    }

    const current = sykmeldinger.data?.sykmeldinger?.aktuelle ?? []
    const previous =
        sykmeldinger.data?.sykmeldinger?.__typename === 'Requested'
            ? (sykmeldinger.data?.sykmeldinger?.historiske ?? [])
            : []
    const days = continiousSykefravaer([...current, ...previous])

    return (
        <div className="mt-4">
            <div className="flex gap-3 flex-wrap">
                <StatWithIcon
                    Icon={BandageIcon}
                    value={sykmeldinger.data?.sykmeldinger?.aktuelle.length ?? 0}
                    label="Pågående sykmeldinger"
                />
                <StatWithIcon
                    Icon={NotePencilDashIcon}
                    value={allDrafts.data?.drafts?.length ?? 0}
                    label="Utkast sykmeldinger"
                />
                {sykmeldinger.data?.sykmeldinger?.__typename === 'Requested' && (
                    <StatWithIcon
                        Icon={ClockDashedIcon}
                        value={sykmeldinger.data?.sykmeldinger.historiske.length ?? 0}
                        label="Tidligere sykmeldinger"
                    />
                )}
                {sykefravaerInfoToggle && (
                    <StatWithIcon
                        Icon={HourglassTopFilledIcon}
                        value={
                            <div className="relative h-full w-full text-xl">
                                <div className="absolute top-0 left-0 text-base text-right w-4">
                                    {+(days / 7).toFixed(0)}
                                </div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-2/3 -translate-y-1/2">/</div>
                                <div className="absolute bottom-0 right-0.5 text-base text-left w-4">52</div>
                            </div>
                        }
                        label="uker påløpt sykefravær"
                    />
                )}
            </div>
        </div>
    )
}

function StatWithIcon({
    Icon,
    value,
    label,
}: {
    Icon: typeof BandageIcon
    value: number | ReactElement
    label: string
}): ReactElement {
    return (
        <div className="flex items-center gap-2">
            <div className="size-12 bg-ax-bg-accent-moderate rounded-full flex items-center justify-center shrink-0">
                <Icon aria-hidden className="size-6" />
            </div>
            {typeof value === 'number' ? (
                <div className="shrink-0 size-10 text-3xl bold flex items-center justify-center">{value}</div>
            ) : (
                <div className="shrink-0 size-10">{value}</div>
            )}
            <div className="uppercase max-w-30 text-sm flex items-center justify-center">{label}</div>
        </div>
    )
}
