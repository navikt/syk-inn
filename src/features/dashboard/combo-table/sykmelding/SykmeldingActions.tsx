import React, { ReactElement, useRef } from 'react'
import { Tooltip } from '@navikt/ds-react'
import { ChevronRightDoubleCircleIcon, ChevronRightIcon, TabsAddIcon } from '@navikt/aksel-icons'

import { SlowNextLinkButton } from '@components/links/SlowNextLinkButton'
import { SykmeldingFragment } from '@queries'
import { useAppDispatch } from '@core/redux/hooks'
import { nySykmeldingActions } from '@core/redux/reducers/ny-sykmelding'

type SykmeldingActionProps = {
    sykmeldingId: string
    sykmelding: SykmeldingFragment
    forlengable?: true
}

export function SykmeldingActions({ sykmeldingId, sykmelding, forlengable }: SykmeldingActionProps): ReactElement {
    return (
        <div className="grid grid-cols-3 gap-2 w-fit ml-2">
            <Tooltip content="Se sykmelding">
                <SlowNextLinkButton
                    href={`/fhir/sykmelding/${sykmeldingId}`}
                    icon={<ChevronRightIcon aria-hidden />}
                    variant="tertiary"
                    size="small"
                />
            </Tooltip>
            <DupliserSykmeldingButton sykmelding={sykmelding} />
            {forlengable && <ForlengSykmeldingButton sykmelding={sykmelding} />}
        </div>
    )
}

function DupliserSykmeldingButton({ sykmelding }: { sykmelding: SykmeldingFragment }): ReactElement {
    const nextDraftId = useRef(crypto.randomUUID())
    const dispatch = useAppDispatch()

    return (
        <Tooltip content="Dupliser sykmeldingen">
            <SlowNextLinkButton
                href={`/fhir/ny/${nextDraftId.current}`}
                onClick={() => {
                    dispatch(nySykmeldingActions.dupliser(sykmelding))
                }}
                icon={<TabsAddIcon aria-hidden />}
                variant="tertiary"
                size="small"
            />
        </Tooltip>
    )
}

function ForlengSykmeldingButton({ sykmelding }: { sykmelding: SykmeldingFragment }): ReactElement {
    const nextDraftId = useRef(crypto.randomUUID())
    const dispatch = useAppDispatch()

    return (
        <Tooltip content="Forleng sykmeldingen">
            <SlowNextLinkButton
                href={`/fhir/ny/${nextDraftId.current}`}
                onClick={() => {
                    dispatch(nySykmeldingActions.forleng(sykmelding))
                }}
                icon={<ChevronRightDoubleCircleIcon aria-hidden />}
                variant="tertiary"
                size="small"
            />
        </Tooltip>
    )
}
