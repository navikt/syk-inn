import React, { ReactElement } from 'react'
import { BodyShort, Detail, Heading, Link } from '@navikt/ds-react'

import { NavLogo } from '@components/misc/NavLogo'
import { getAbsoluteURL, pathWithBasePath } from '@lib/url'
import { isCloud } from '@lib/env'

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
        <div className="border-b border-b-ax-border-neutral-subtle h-20 max-h-20 flex justify-between px-2 bg-ax-bg-default">
            <div className="flex justify-center items-center gap-8">
                <NavLogo className="ml-2 text-ax-text-logo" />
                <Heading level="1" size="medium">
                    Innsending av Sykmelding
                </Heading>
            </div>
            <div className="h-full flex flex-col justify-center items-end mr-2">
                <div className="flex gap-3 items-center">
                    <div>
                        <BodyShort>{behandler.navn}</BodyShort>
                        <div className="flex justify-between items-center gap-3">
                            <div>{behandler.hpr && <Detail>{behandler.hpr}</Detail>}</div>
                            {isCloud && (
                                <Link
                                    className="text-sm -mt-0.5"
                                    href={pathWithBasePath(`/oauth2/logout?redirect=${getAbsoluteURL()}`)}
                                >
                                    Logg ut
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HelseIdHeader
