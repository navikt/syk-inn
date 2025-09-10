import React, { ReactElement } from 'react'
import { ChevronRightDoubleCircleIcon, TabsAddIcon } from '@navikt/aksel-icons'

import { SykmeldingFragment } from '@queries'
import { byActiveOrFutureSykmelding } from '@data-layer/common/sykmelding-utils'
import { SlowNextLinkButton } from '@components/links/SlowNextLinkButton'

export function TidligereSykmeldingActions({ sykmelding }: { sykmelding: SykmeldingFragment }): ReactElement {
    const isActiveOrFuture = byActiveOrFutureSykmelding(sykmelding)

    return (
        <div className="flex gap-2">
            <SlowNextLinkButton
                href={`/fhir/dupliser/${sykmelding.sykmeldingId}`}
                icon={<TabsAddIcon aria-hidden />}
                variant="tertiary"
                size="small"
            >
                Dupliser
            </SlowNextLinkButton>
            {isActiveOrFuture && (
                <SlowNextLinkButton
                    href={`/fhir/forleng/${sykmelding.sykmeldingId}`}
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
