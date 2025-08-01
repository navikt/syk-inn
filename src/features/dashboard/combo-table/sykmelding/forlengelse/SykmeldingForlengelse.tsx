import React, { ReactElement, useRef } from 'react'
import { Tooltip } from '@navikt/ds-react'
import { ChevronRightDoubleCircleIcon } from '@navikt/aksel-icons'

import { SykmeldingFragment } from '@queries'
import { SlowNextLinkButton } from '@components/links/SlowNextLinkButton'
import { useAppDispatch } from '@core/redux/hooks'
import { nySykmeldingActions } from '@core/redux/reducers/ny-sykmelding'

export function ForlengSykmeldingButton({ sykmelding }: { sykmelding: SykmeldingFragment }): ReactElement {
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
