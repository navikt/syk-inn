import React, { ReactElement } from 'react'
import { Tooltip } from '@navikt/ds-react'
import { ChevronRightIcon, TabsAddIcon } from '@navikt/aksel-icons'

import { SlowNextLinkButton } from '@components/links/SlowNextLinkButton'
import { SykmeldingFragment } from '@queries'

type SykmeldingActionProps = {
    sykmeldingId: string
    sykmelding: SykmeldingFragment
    forlengable?: true
}

export function SykmeldingActions({ sykmeldingId, sykmelding, forlengable }: SykmeldingActionProps): ReactElement {
    return (
        <div className="grid grid-flow-col auto-cols-max gap-2">
            <Tooltip content="Åpne">
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
    return (
        <Tooltip content="Dupliser">
            <SlowNextLinkButton
                href={`/fhir/dupliser/${sykmelding.sykmeldingId}`}
                icon={<TabsAddIcon aria-hidden />}
                variant="tertiary"
                size="small"
            />
        </Tooltip>
    )
}

function ForlengSykmeldingButton({ sykmelding }: { sykmelding: SykmeldingFragment }): ReactElement {
    return (
        <SlowNextLinkButton href={`/fhir/forleng/${sykmelding.sykmeldingId}`} variant="secondary" size="small">
            Forlenge
        </SlowNextLinkButton>
    )
}
