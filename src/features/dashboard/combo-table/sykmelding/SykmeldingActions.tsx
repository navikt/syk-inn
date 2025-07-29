import React, { ReactElement } from 'react'
import { Tooltip } from '@navikt/ds-react'
import { ChevronRightIcon } from '@navikt/aksel-icons'

import { SlowNextLinkButton } from '@components/misc/SlowNextLinkButton'
import { SykmeldingFragment } from '@queries'

import { ForlengSykmeldingButton } from './forlengelse/SykmeldingForlengelse'
import { DupliserSykmeldingButton } from './duplisering/SykmeldingDupliser'

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
