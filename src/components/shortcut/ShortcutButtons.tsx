import React, { PropsWithChildren, ReactElement, useCallback, useRef } from 'react'
import { Button, ButtonProps, Popover } from '@navikt/ds-react'
import { useRouter } from 'next/navigation'

import { SlowNextLinkButton } from '@components/links/SlowNextLinkButton'
import { Shortcut, useShortcut } from '@lib/hooks/shortcuts/useShortcut'
import { useCurrentModifier } from '@lib/hooks/shortcuts/useCurrentModifier'
import { cn } from '@lib/tw'

type BaseShortcutButtonProps = {
    shortcut: Shortcut
    className?: string
    /**
     * Can be used when shortcut buttons are rendered behind for example a Modal, to avoid
     * showing the shortcut hint when the button is not interactable.
     */
    inactive?: boolean
} & Pick<ButtonProps, 'id' | 'loading' | 'size' | 'variant' | 'disabled' | 'icon' | 'iconPosition'>

export function ShortcutButtons({
    onClick,
    children,
    shortcut,
    inactive,
    className,
    ...buttonProps
}: PropsWithChildren<BaseShortcutButtonProps & { onClick: () => void }>): ReactElement {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const registeredShortcut = useShortcut(
        shortcut,
        () => {
            onClick()
        },
        buttonProps.disabled || inactive === true,
    )
    const currentMod = useCurrentModifier()

    return (
        <div className={cn('relative', className)}>
            <Button ref={buttonRef} type="button" className="w-full" onClick={() => onClick()} {...buttonProps}>
                {children}
            </Button>
            <Popover
                open={currentMod === shortcut.modifier && inactive !== true}
                onClose={() => void 0}
                anchorEl={buttonRef.current}
                arrow={false}
                offset={4}
                placement="bottom-end"
            >
                <Popover.Content className="whitespace-nowrap text-sm py-1 px-2 border-border-subtle text-text-subtle font-bold">
                    Hurtigtast: {registeredShortcut.label}
                </Popover.Content>
            </Popover>
        </div>
    )
}

export function ShortcutButtonLink({
    href,
    children,
    shortcut,
    inactive,
    className,
    ...buttonProps
}: PropsWithChildren<
    BaseShortcutButtonProps & {
        href: string
    }
>): ReactElement {
    const buttonRef = useRef<HTMLAnchorElement>(null)
    const router = useRouter()
    const registeredShortcut = useShortcut(
        shortcut,
        useCallback(() => {
            router.push(href)
        }, [router, href]),
        buttonProps.disabled || inactive === true,
    )
    const currentMod = useCurrentModifier()

    return (
        <div className={cn('relative w-fit', className)}>
            <SlowNextLinkButton ref={buttonRef} type="button" href={href} {...buttonProps} suppressHydrationWarning>
                {children}
            </SlowNextLinkButton>
            <Popover
                open={currentMod === shortcut.modifier && inactive !== true}
                onClose={() => void 0}
                anchorEl={buttonRef.current}
                arrow={false}
                offset={4}
                placement="bottom-end"
            >
                <Popover.Content className="whitespace-nowrap text-sm py-1 px-2 border-border-subtle text-text-subtle font-bold">
                    Hurtigtast: {registeredShortcut.label}
                </Popover.Content>
            </Popover>
        </div>
    )
}

export function ShortcutSubmitButton({
    shortcut,
    children,
    inactive,
    className,
    ...buttonProps
}: PropsWithChildren<BaseShortcutButtonProps>): ReactElement {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const registeredShortcut = useShortcut(
        shortcut,
        useCallback(() => {
            buttonRef.current?.click()
        }, []),
        buttonProps.disabled || inactive === true,
    )
    const currentMod = useCurrentModifier()

    return (
        <div className={cn('relative', className)}>
            <Button ref={buttonRef} className="w-full" type="submit" {...buttonProps}>
                {children}
            </Button>
            <Popover
                open={currentMod === shortcut.modifier && inactive !== true}
                onClose={() => void 0}
                anchorEl={buttonRef.current}
                arrow={false}
                offset={4}
                placement="bottom-end"
            >
                <Popover.Content className="whitespace-nowrap text-sm py-1 px-2 border-border-subtle text-text-subtle font-bold">
                    Hurtigtast: {registeredShortcut.label}
                </Popover.Content>
            </Popover>
        </div>
    )
}
