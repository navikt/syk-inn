import React, { ReactElement } from 'react'
import { Tooltip } from '@navikt/ds-react'
import { ChevronRightIcon, TabsAddIcon } from '@navikt/aksel-icons'

import { SlowNextLinkButton } from '@components/links/SlowNextLinkButton'
import { SykmeldingFragment } from '@queries'
import { useMode } from '@core/providers/Modes'

type SykmeldingActionProps = {
    sykmeldingId: string
    sykmelding: SykmeldingFragment
    forlengable?: true
}

export function SykmeldingActions({ sykmeldingId, sykmelding, forlengable }: SykmeldingActionProps): ReactElement {
    const mode = useMode()

    return (
        <div className="grid grid-flow-col auto-cols-max gap-2">
            <Tooltip content="Åpne">
                <SlowNextLinkButton
                    href={mode.paths.sykmelding(sykmeldingId)}
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
    const mode = useMode()

    return (
        <Tooltip content="Dupliser">
            <SlowNextLinkButton
                href={mode.paths.dupliser(sykmelding.sykmeldingId)}
                icon={<TabsAddIcon aria-hidden />}
                variant="tertiary"
                size="small"
            />
        </Tooltip>
    )
}

function ForlengSykmeldingButton({ sykmelding }: { sykmelding: SykmeldingFragment }): ReactElement {
    const mode = useMode()

    return (
        <SlowNextLinkButton href={mode.paths.forleng(sykmelding.sykmeldingId)} variant="secondary" size="small">
            Forlenge
        </SlowNextLinkButton>
    )
}
