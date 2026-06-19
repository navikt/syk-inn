import Link, { LinkProps } from 'next/link'
import React, { ReactElement } from 'react'

export function AssableNextLink({ href, ...rest }: LinkProps): ReactElement {
    return <Link href={href ?? '#'} {...rest} />
}
