import { Link as AkselLink } from '@navikt/ds-react'
import React, { PropsWithChildren, ReactElement } from 'react'
import Link from 'next/link'

function AkselNextLink({ children, href }: PropsWithChildren<{ href: string }>): ReactElement {
    return (
        <AkselLink as={Link} href={href}>
            {children}
        </AkselLink>
    )
}

export default AkselNextLink
