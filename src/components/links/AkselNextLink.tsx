'use client'

import { Link as AkselLink } from '@navikt/ds-react'
import React, { PropsWithChildren, ReactElement } from 'react'
import Link from 'next/link'

export function AkselNextLink({
    children,
    href,
    prefetch,
    className,
}: PropsWithChildren<{ href: string; prefetch?: boolean; className?: string }>): ReactElement {
    return (
        <AkselLink as={Link} href={href} className={className} prefetch={prefetch}>
            {children}
        </AkselLink>
    )
}
