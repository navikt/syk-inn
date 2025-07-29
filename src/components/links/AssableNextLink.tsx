import React, { ReactElement } from 'react'
import Link, { LinkProps } from 'next/link'

function AssableNextLink({ href, ...rest }: LinkProps): ReactElement {
    return <Link href={href ?? '#'} {...rest} />
}

export default AssableNextLink
