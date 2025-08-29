import React, { ReactElement } from 'react'
import { BodyShort, Detail, Heading } from '@navikt/ds-react'

import { NavLogo } from '@components/misc/NavLogo'

type Props = {
    behandler: {
        navn: string
        hpr: string | null
    }
}

/**
 * Functionally the app in standalone version should probably have the actual NAV Decorator. But until
 * HelseID/custom id providers are better supported, we'll roll our own "simple" header.
 *
 * See discussion: https://nav-it.slack.com/archives/CAFRFDJMN/p1727428714358099
 */
function HelseIdHeader({ behandler }: Props): ReactElement {
    return (
        <div className="border-b border-b-border-subtle h-20 max-h-20 flex justify-between px-2 bg-white">
            <div className="flex justify-center items-center gap-8">
                <NavLogo className="ml-2 text-nav-red" />
                <Heading level="1" size="medium">
                    Innsending av Sykmelding
                </Heading>
            </div>
            <div className="h-full flex flex-col justify-center items-end mr-2">
                <div className="flex gap-3 items-center">
                    <div>
                        <BodyShort>{behandler.navn}</BodyShort>
                        {behandler.hpr && <Detail>{behandler.hpr}</Detail>}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HelseIdHeader
