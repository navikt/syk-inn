import { ChevronRightDoubleCircleIcon, TabsAddIcon } from '@navikt/aksel-icons'
import React, { ReactElement } from 'react'

import { SlowNextLinkButton } from '#components/links/SlowNextLinkButton'
import { useMode } from '#core/providers/Modes'
import { isTodayOrInTheFuture } from '#data-layer/common/sykmelding-utils'
import { SykmeldingFragment } from '#queries'

export function TidligereSykmeldingActions({ sykmelding }: { sykmelding: SykmeldingFragment }): ReactElement {
    const mode = useMode()
    const isActiveOrFuture = isTodayOrInTheFuture(sykmelding)

    return (
        <div className="flex gap-2">
            <SlowNextLinkButton
                href={mode.paths.dupliser(sykmelding.sykmeldingId)}
                icon={<TabsAddIcon aria-hidden />}
                variant="tertiary"
                size="small"
            >
                Dupliser
            </SlowNextLinkButton>
            {isActiveOrFuture && (
                <SlowNextLinkButton
                    href={mode.paths.forleng(sykmelding.sykmeldingId)}
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
