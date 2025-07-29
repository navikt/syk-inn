import React, { ReactElement, useEffect, useState } from 'react'
import { Button, ButtonProps } from '@navikt/ds-react'
import { useLinkStatus } from 'next/link'

import AssableNextLink from '@components/misc/AssableNextLink'

/**
 * A button that behaves like a link, but gives the user some feedback when clicking the link. Useful if the
 * page is slow to load or if the link is not immediately available.
 *
 * This is also gives the user some visual feedback even when there is network slowness.
 */
export function SlowNextLinkButton({
    children,
    href,
    loading,
    icon,
    ...buttonProps
}: { href: string } & ButtonProps): ReactElement {
    const [isLinkPending, setLinkPending] = useState(false)

    if (icon != null && children == null) {
        /**
         * Icon button without children, we need to hide the inside the Icon. This is because the aksel-button
         * will add a child span if we try to pass _any_ children (even null/undefined) to the Button component.
         *
         * The only requirement for LinkStatusSynchronizer is to be rendered _below_ the actual link, so sneaking
         * it into the icon as a fragment works.
         *
         */
        return (
            <Button
                as={AssableNextLink}
                href={href}
                loading={isLinkPending || loading}
                {...buttonProps}
                icon={
                    <>
                        {icon}
                        <LinkStatusSynchronizer setPending={setLinkPending} />
                    </>
                }
            />
        )
    }

    return (
        <Button
            as={AssableNextLink}
            type="button"
            href={href}
            loading={isLinkPending || loading}
            icon={icon}
            {...buttonProps}
        >
            {children}
            <LinkStatusSynchronizer setPending={setLinkPending} />
        </Button>
    )
}

function LinkStatusSynchronizer({ setPending }: { setPending: (pending: boolean) => void }): undefined {
    const { pending } = useLinkStatus()

    useEffect(() => {
        setPending(pending)
    }, [pending, setPending])

    return undefined
}
