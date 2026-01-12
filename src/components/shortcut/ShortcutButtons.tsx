import React, { PropsWithChildren, ReactElement, Ref, useCallback, useImperativeHandle, useRef } from 'react'
import { Button, ButtonProps, Popover } from '@navikt/ds-react'
import { useRouter } from 'next/navigation'

import { SlowNextLinkButton } from '@components/links/SlowNextLinkButton'
import { Shortcut, useShortcut } from '@lib/hooks/shortcuts/useShortcut'
import { useCurrentModifier } from '@lib/hooks/shortcuts/useCurrentModifier'
import { cn } from '@lib/tw'

type BaseShortcutButtonProps = {
    shortcut: Shortcut
    className?: string
    buttonClassName?: string
    /**
     * Can be used when shortcut buttons are rendered behind for example a Modal, to avoid
     * showing the shortcut hint when the button is not interactable.
     */
    inactive?: boolean
} & Pick<ButtonProps, 'id' | 'loading' | 'size' | 'variant' | 'disabled' | 'icon' | 'iconPosition'>

export function ShortcutButton({
    ref,
    onClick,
    children,
    shortcut,
    inactive,
    className,
    buttonClassName,
    ...buttonProps
}: PropsWithChildren<
    BaseShortcutButtonProps & {
        ref?: Ref<HTMLButtonElement>
        onClick?: () => void
    }
>): ReactElement {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const registeredShortcut = useShortcut(
        shortcut,
        () => {
            buttonRef.current?.click()
        },
        buttonProps.disabled || inactive === true,
    )
    const currentMod = useCurrentModifier()

    useImperativeHandle<HTMLButtonElement | null, HTMLButtonElement | null>(ref, () => buttonRef.current)

    return (
        <div className={cn('relative', className)}>
            <Button
                ref={buttonRef}
                type="button"
                className={cn('w-full', buttonClassName)}
                onClick={onClick}
                {...buttonProps}
            >
                {children}
            </Button>
            <Popover
                open={currentMod === shortcut.modifier && inactive !== true}
                onClose={() => void 0}
                anchorEl={buttonRef.current}
                arrow={false}
                offset={4}
                placement={shortcut.hintPlacement ?? 'bottom-end'}
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
    buttonClassName,
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
            <SlowNextLinkButton
                ref={buttonRef}
                type="button"
                href={href}
                className={buttonClassName}
                {...buttonProps}
                suppressHydrationWarning
            >
                {children}
            </SlowNextLinkButton>
            <Popover
                open={currentMod === shortcut.modifier && inactive !== true}
                onClose={() => void 0}
                anchorEl={buttonRef.current}
                arrow={false}
                offset={4}
                placement={shortcut.hintPlacement ?? 'bottom-end'}
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
    buttonClassName,
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
            <Button ref={buttonRef} className={cn('w-full', buttonClassName)} type="submit" {...buttonProps}>
                {children}
            </Button>
            <Popover
                open={currentMod === shortcut.modifier && inactive !== true}
                onClose={() => void 0}
                anchorEl={buttonRef.current}
                arrow={false}
                offset={4}
                placement={shortcut.hintPlacement ?? 'bottom-end'}
            >
                <Popover.Content className="whitespace-nowrap text-sm py-1 px-2 border-border-subtle text-text-subtle font-bold">
                    Hurtigtast: {registeredShortcut.label}
                </Popover.Content>
            </Popover>
        </div>
    )
}
