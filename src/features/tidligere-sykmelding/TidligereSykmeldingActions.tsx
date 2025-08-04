import React, { ReactElement, useRef } from 'react'
import { ChevronRightDoubleCircleIcon, TabsAddIcon } from '@navikt/aksel-icons'

import { SykmeldingFragment } from '@queries'
import { useAppDispatch } from '@core/redux/hooks'
import { byActiveOrFutureSykmelding } from '@data-layer/common/sykmelding-utils'
import { SlowNextLinkButton } from '@components/links/SlowNextLinkButton'
import { nySykmeldingActions } from '@core/redux/reducers/ny-sykmelding'

export function TidligereSykmeldingActions({ sykmelding }: { sykmelding: SykmeldingFragment }): ReactElement {
    const nextDraftId = useRef(crypto.randomUUID())
    const dispatch = useAppDispatch()

    const isActiveOrFuture = byActiveOrFutureSykmelding(sykmelding)

    return (
        <div className="flex gap-2">
            <SlowNextLinkButton
                href={`/fhir/ny/${nextDraftId.current}`}
                onClick={() => {
                    dispatch(nySykmeldingActions.dupliser(sykmelding))
                }}
                icon={<TabsAddIcon aria-hidden />}
                variant="tertiary"
                size="small"
            >
                Dupliser
            </SlowNextLinkButton>
            {isActiveOrFuture && (
                <SlowNextLinkButton
                    href={`/fhir/ny/${nextDraftId.current}`}
                    onClick={() => {
                        dispatch(nySykmeldingActions.forleng(sykmelding))
                    }}
                    icon={<ChevronRightDoubleCircleIcon aria-hidden />}
                    variant="tertiary"
                    size="small"
                >
                    Forleng
                </SlowNextLinkButton>
            )}
        </div>
    )
}
