import React, { ReactElement } from 'react'
import { useQuery } from '@apollo/client/react'
import { Skeleton } from '@navikt/ds-react'
import * as R from 'remeda'

import { AllSykmeldingerDocument, GetAllDraftsDocument, SykmeldingFragment } from '@queries'
import { byActiveOrFutureSykmelding } from '@data-layer/common/sykmelding-utils'

function DumbStats(): ReactElement {
    const allDrafts = useQuery(GetAllDraftsDocument)
    const sykmeldinger = useQuery(AllSykmeldingerDocument)

    if (allDrafts.loading || sykmeldinger.loading) {
        return (
            <div className="mb-2 flex gap-12 -mt-2">
                <Skeleton variant="rounded" className="w-50 h-full" />
            </div>
        )
    }

    const [current, previous] = R.partition<SykmeldingFragment>(
        sykmeldinger.data?.sykmeldinger ?? [],
        byActiveOrFutureSykmelding,
    )

    return (
        <div className="-mt-2 mb-2 flex gap-12">
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
