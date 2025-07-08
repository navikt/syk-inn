import React, { ReactElement, useRef } from 'react'
import { Tooltip } from '@navikt/ds-react'
import { ChevronRightDoubleCircleIcon } from '@navikt/aksel-icons'

import { SykmeldingFragment } from '@queries'
import { SlowNextLinkButton } from '@components/misc/SlowNextLinkButton'

import { useAppDispatch } from '../../../../../providers/redux/hooks'
import { nySykmeldingMultistepActions } from '../../../../../providers/redux/reducers/ny-sykmelding-multistep'

import { forlengSykmelding } from './forlengelse-mappers'

export function ForlengSykmeldingButton({ sykmelding }: { sykmelding: SykmeldingFragment }): ReactElement {
    const nextDraftId = useRef(crypto.randomUUID())
    const dispatch = useAppDispatch()

    return (
        <Tooltip content="Forleng sykmeldingen">
            <SlowNextLinkButton
                href={`/fhir/ny/${nextDraftId.current}`}
                onClick={() => {
                    dispatch(nySykmeldingMultistepActions.completeMainStep(forlengSykmelding(sykmelding)))
                }}
                icon={<ChevronRightDoubleCircleIcon aria-hidden />}
                variant="tertiary"
                size="small"
            />
        </Tooltip>
    )
}
