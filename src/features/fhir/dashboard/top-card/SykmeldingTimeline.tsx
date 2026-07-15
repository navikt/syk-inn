import { useQuery } from '@apollo/client/react'
import { BandageIcon } from '@navikt/aksel-icons'
import { BodyShort, Detail, Heading, Skeleton, Timeline } from '@navikt/ds-react'
import { addDays, parseISO } from 'date-fns/fp'
import { useRouter } from 'next/navigation'
import React, { ReactElement } from 'react'
import * as R from 'remeda'

import { AkselNextLink } from '#components/links/AkselNextLink'
import { useMode } from '#core/providers/Modes'
import {
    earliestFom,
    getAllSykmeldingerFromQuery,
    isTodayOrInTheFuture,
    latestTom,
} from '#data-layer/common/sykmelding-utils'
import { AllDashboardDocument, DraftFragment, SykmeldingFragment } from '#queries'

import { AutoUpdatingDistance } from '../combo-table/draft/AutoUpdatingDistance'
import {
    draftAktivitetText,
    draftArbeidsforholdText,
    draftDiagnoseText,
    draftPeriodeText,
} from '../combo-table/draft/draft-utils'
import {
    sykmeldingArbeidsgiverText,
    sykmeldingDiagnoseText,
    sykmeldingGradText,
} from '../combo-table/sykmelding/sykmelding-utils'
import { SykmeldingPeriodeLink } from '../combo-table/sykmelding/SykmeldingPeriodeLink'

import {
    getLatestDraftDate,
    getLatestSykmeldingerDate,
    partitionDraftLanes,
    partitionSykmeldingLanes,
} from './sykmeldinger-timeline-utils'

export function SykmeldingTimeline(): ReactElement | null {
    const { loading, data, error } = useQuery(AllDashboardDocument)

    if (loading) {
        return (
            <div className="flex flex-col gap-3 mb-8">
                <div className="ml-28 mr-4 flex flex-row justify-around">
                    <Skeleton variant="text" width="12ch" />
                    <Skeleton variant="text" width="12ch" />
                    <Skeleton variant="text" width="12ch" />
                </div>
                <div className="flex gap-8">
                    <Skeleton width="9ch" />
                    <Skeleton variant="rounded" width="100%" />
                </div>
            </div>
        )
    }

    if (error) {
        return (
            // A more complete and obvious error is rendered in the table, this error is mostly to stop weird
            // layout shifts when errors occur, it takes the exact same space as the loading skeleton
            <div className="flex flex-col gap-3 mb-8">
                <div className="flex flex-row">
                    <Heading level="3" size="xsmall">
                        Kunne ikke vise tidslinje
                    </Heading>
                </div>
                <div className="flex gap-8">
                    <BodyShort>Lasting av sykmeldinger og utkast feilet</BodyShort>
                </div>
            </div>
        )
    }

    const allSykmeldinger = getAllSykmeldingerFromQuery(data?.sykmeldinger)
    if (!R.hasAtLeast(allSykmeldinger, 1)) {
        // There are other more logically placed empty states, for users without any, don't render anything
        return null
    }

    return (
        <div className="mb-8">
            <FullTimeline sykmeldinger={allSykmeldinger} drafts={data?.drafts ?? []} />
        </div>
    )
}

function FullTimeline({
    sykmeldinger,
    drafts,
}: {
    drafts: DraftFragment[]
    sykmeldinger: [SykmeldingFragment, ...SykmeldingFragment[]]
}): ReactElement {
    const mode = useMode()
    const router = useRouter()
    const draftLanes = partitionDraftLanes(drafts)
    const sykmeldingLanes = partitionSykmeldingLanes(sykmeldinger)

    const latestSykmeldingDate = getLatestSykmeldingerDate(sykmeldinger)
    const latestDraftDate = getLatestDraftDate(draftLanes)

    const latestDate = latestDraftDate
        ? R.firstBy([latestDraftDate, latestSykmeldingDate], [R.identity(), 'desc'])
        : latestSykmeldingDate

    return (
        <Timeline endDate={addDays(1)(latestDate)}>
            {draftLanes.map((lane, index) => (
                <Timeline.Row key={index} label={index === 0 ? 'Utkast' : ''}>
                    {lane.map(([draft, values, fomtom]) => {
                        return (
                            <Timeline.Period
                                key={draft.draftId}
                                start={fomtom.fom}
                                end={fomtom.tom}
                                statusLabel="Hey"
                                status="info"
                                icon={<BandageIcon />}
                                onSelectPeriod={() => {
                                    router.push(mode.paths.utkast(draft.draftId))
                                }}
                            >
                                <AkselNextLink href={mode.paths.utkast(draft.draftId)}>
                                    {draftPeriodeText(values.perioder)}
                                </AkselNextLink>
                                <BodyShort>{draftDiagnoseText(values?.hoveddiagnose)}</BodyShort>
                                <BodyShort>{draftAktivitetText(values?.perioder)}</BodyShort>
                                <BodyShort>{draftArbeidsforholdText(values?.arbeidsforhold)}</BodyShort>
                                <Detail className="text-xs mt-2">
                                    Sist endret <AutoUpdatingDistance time={draft.lastUpdated} />
                                </Detail>
                            </Timeline.Period>
                        )
                    })}
                </Timeline.Row>
            ))}

            {sykmeldingLanes.map((lane, index) => (
                <Timeline.Row key={index} label={index === 0 ? 'Sykmeldinger' : ''}>
                    {lane.map((it) => {
                        const fom = parseISO(earliestFom(it))
                        const tom = parseISO(latestTom(it))
                        const isCurrent = isTodayOrInTheFuture(it)

                        return (
                            <Timeline.Period
                                key={it.sykmeldingId}
                                start={fom}
                                end={tom}
                                statusLabel="Hey"
                                status={isCurrent ? 'success' : 'neutral'}
                                icon={<BandageIcon />}
                                onSelectPeriod={() => {
                                    router.push(mode.paths.sykmelding(it.sykmeldingId))
                                }}
                            >
                                <SykmeldingPeriodeLink sykmeldingId={it.sykmeldingId} aktivitet={it.values.aktivitet} />
                                {it.__typename !== 'SykmeldingRedacted' && (
                                    <>
                                        <BodyShort>{sykmeldingDiagnoseText(it.values.hoveddiagnose)}</BodyShort>
                                        <BodyShort>{sykmeldingGradText(it.values.aktivitet)} sykmelding</BodyShort>
                                    </>
                                )}
                                {it.__typename === 'SykmeldingFull' && (
                                    <>
                                        <BodyShort>{sykmeldingArbeidsgiverText(it.values.arbeidsgiver)}</BodyShort>
                                    </>
                                )}
                            </Timeline.Period>
                        )
                    })}
                </Timeline.Row>
            ))}
        </Timeline>
    )
}
