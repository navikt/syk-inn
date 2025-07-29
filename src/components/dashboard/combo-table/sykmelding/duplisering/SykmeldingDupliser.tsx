import React, { ReactElement, useRef } from 'react'
import { Tooltip } from '@navikt/ds-react'
import { TabsAddIcon } from '@navikt/aksel-icons'

import { SykmeldingFragment } from '@queries'
import { SlowNextLinkButton } from '@components/misc/SlowNextLinkButton'
import { useAppDispatch } from '@core/redux/hooks'
import { nySykmeldingMultistepActions } from '@core/redux/reducers/ny-sykmelding-multistep'

import { dupliserSykmelding } from './duplisering-mapper'

export function DupliserSykmeldingButton({ sykmelding }: { sykmelding: SykmeldingFragment }): ReactElement {
    const nextDraftId = useRef(crypto.randomUUID())
    const dispatch = useAppDispatch()

    return (
        <Tooltip content="Dupliser sykmeldingen">
            <SlowNextLinkButton
                href={`/fhir/ny/${nextDraftId.current}`}
                onClick={() => {
                    dispatch(nySykmeldingMultistepActions.completeMainStep(dupliserSykmelding(sykmelding)))
                }}
                icon={<TabsAddIcon aria-hidden />}
                variant="tertiary"
                size="small"
            />
        </Tooltip>
    )
}
