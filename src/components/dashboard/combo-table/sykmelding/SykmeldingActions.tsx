import React, { ReactElement } from 'react'
import { Button, Tooltip } from '@navikt/ds-react'
import { ChevronRightIcon, TabsAddIcon } from '@navikt/aksel-icons'

import { SlowNextLinkButton } from '@components/misc/SlowNextLinkButton'
import { SykmeldingFragment } from '@queries'
import { ForlengSykmeldingButton } from '@components/dashboard/combo-table/sykmelding/forlengelse/SykmeldingForlengelse'

/**
 * Temporary flag to hide the unimplemented buttons while keeping TSC and lint happy.
 */
const IMPLEMENTATION_FLAG = false

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
            {IMPLEMENTATION_FLAG && (
                <>
                    <Tooltip content="Dupliser sykmeldingen">
                        <Button icon={<TabsAddIcon aria-hidden />} variant="tertiary" size="small" />
                    </Tooltip>
                </>
            )}
            {forlengable && <ForlengSykmeldingButton sykmelding={sykmelding} />}
        </div>
    )
}
