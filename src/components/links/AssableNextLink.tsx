import React, { ReactElement } from 'react'
import Link, { LinkProps } from 'next/link'

export function AssableNextLink({ href, ...rest }: LinkProps): ReactElement {
    return <Link href={href ?? '#'} {...rest} />
}
