import { addDays, parseISO } from 'date-fns/fp'
import * as R from 'remeda'

import { earliestFom, latestTom } from '#data-layer/common/sykmelding-utils'
import { DraftValues, safeParseDraft } from '#data-layer/draft/draft-schema'
import { DraftFragment, SykmeldingFragment } from '#queries'

import { maybeFom, maybeTom } from '../combo-table/draft/draft-utils'

export const getLatestDraftDate = (lanes: DraftValueTriple[][]): Date | null | undefined =>
    R.pipe(
        lanes,
        R.flat(),
        R.map(([, _, fomtom]) => fomtom.tom),
        R.firstBy([R.identity(), 'desc']),
    )

export const getLatestSykmeldingerDate = (sykmeldinger: [SykmeldingFragment, ...SykmeldingFragment[]]): Date =>
    R.pipe(sykmeldinger, R.map(latestTom), R.firstBy([R.identity(), 'desc']), parseISO)

export const partitionSykmeldingLanes = (
    sykmeldinger: [SykmeldingFragment, ...SykmeldingFragment[]],
): SykmeldingFragment[][] =>
    partitionLanesBy(
        sykmeldinger,
        (it) => parseISO(earliestFom(it)),
        (it) => parseISO(latestTom(it)),
    )

type DraftValueTriple = readonly [DraftFragment, DraftValues, { fom: Date; tom: Date }]

export function partitionDraftLanes(drafts: DraftFragment[]): DraftValueTriple[][] {
    const values: DraftValueTriple[] = drafts
        .map((draft) => {
            const parsed = safeParseDraft(draft.draftId, draft.values)
            if (!parsed) return null

            return [draft, parsed] as const
        })
        .filter(R.isNonNull)
        .map(
            ([draft, values]) =>
                [
                    draft,
                    values,
                    {
                        fom: laneFom(values.perioder),
                        tom: laneTom(values.perioder),
                    },
                ] as const,
        )

    if (!R.hasAtLeast(values, 1)) return []

    return partitionLanesBy(
        values,
        ([, parsed]) => {
            const fom = maybeFom(parsed.perioder)
            if (fom) return parseISO(fom)

            // Fallback to todays fom date, so that it fits in the timeline
            return new Date()
        },
        ([, parsed]) => {
            const tom = maybeTom(parsed.perioder)
            const fom = maybeFom(parsed.perioder)

            if (tom) return parseISO(tom)

            // If no tom, use fom + 1 day, so that it shows up in timeline
            if (!tom && fom) return addDays(1)(parseISO(fom))

            // If no fom either (wat) just use today plus one day to match with fom logic
            return addDays(1)(new Date())
        },
    )
}

function laneFom(perioder: DraftValues['perioder']): Date {
    const fom = maybeFom(perioder)
    if (fom) return parseISO(fom)

    // Fallback to todays fom date, so that it fits in the timeline
    return new Date()
}

function laneTom(perioder: DraftValues['perioder']): Date {
    const tom = maybeTom(perioder)
    const fom = maybeFom(perioder)

    if (tom) return parseISO(tom)

    // If no tom, use fom + 1 day, so that it shows up in timeline
    if (!tom && fom) return addDays(1)(parseISO(fom))

    // If no fom either (wat) just use today plus one day to match with fom logic
    return addDays(1)(new Date())
}

function partitionLanesBy<Type>(
    sykmeldinger: [Type, ...Type[]],
    fom: (item: Type) => Date,
    tom: (item: Type) => Date,
): Type[][] {
    const sorted = R.sortBy(sykmeldinger, [fom, 'asc'])

    const lanes: Type[][] = []
    const laneEnd: Date[] = []

    for (const sykmelding of sorted) {
        const start: Date = fom(sykmelding)
        const end: Date = tom(sykmelding)

        const laneIndex = laneEnd.findIndex((laneEndDate) => start > laneEndDate)

        if (laneIndex === -1) {
            lanes.push([sykmelding])
            laneEnd.push(end)
        } else {
            lanes[laneIndex].push(sykmelding)
            laneEnd[laneIndex] = end
        }
    }

    return lanes
}
