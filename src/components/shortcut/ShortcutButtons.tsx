import React, { PropsWithChildren, ReactElement, useCallback, useRef } from 'react'
import { Button, ButtonProps, Detail } from '@navikt/ds-react'
import { useRouter } from 'next/navigation'
import { AnimatePresence } from 'motion/react'

import { FastFadeReveal } from '@components/animation/Reveal'
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
    const registeredShortcut = useShortcut(shortcut, () => {
        if (buttonProps.disabled) return
        onClick()
    })
    const currentMod = useCurrentModifier()

    return (
        <div className={cn('relative', className)}>
            <Button type="button" className="w-full" onClick={() => onClick()} {...buttonProps}>
                {children}
            </Button>
            <div className="absolute -bottom-5 right-2 text-text-action">
                <AnimatePresence>
                    {currentMod === shortcut.modifier && inactive !== true && (
                        <FastFadeReveal>
                            <Detail className="font-bold">Hurtigtast: {registeredShortcut.label}</Detail>
                        </FastFadeReveal>
                    )}
                </AnimatePresence>
            </div>
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
    const router = useRouter()
    const registeredShortcut = useShortcut(
        shortcut,
        useCallback(() => {
            router.push(href)
        }, [router, href]),
    )
    const currentMod = useCurrentModifier()

    return (
        <div className={cn('relative w-fit', className)}>
            <SlowNextLinkButton type="button" href={href} {...buttonProps} suppressHydrationWarning>
                {children}
            </SlowNextLinkButton>
            <div className="absolute -bottom-5 right-2 text-text-action">
                <AnimatePresence>
                    {currentMod === shortcut.modifier && inactive !== true && (
                        <FastFadeReveal>
                            <Detail className="font-bold">Hurtigtast: {registeredShortcut.label}</Detail>
                        </FastFadeReveal>
                    )}
                </AnimatePresence>
            </div>
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
    )
    const currentMod = useCurrentModifier()

    return (
        <div className={cn('relative', className)}>
            <Button ref={buttonRef} className="w-full" type="submit" {...buttonProps}>
                {children}
            </Button>
            <div className="absolute -bottom-5 right-2 text-text-action">
                <AnimatePresence>
                    {currentMod === shortcut.modifier && inactive !== true && (
                        <FastFadeReveal>
                            <Detail className="font-bold">Hurtigtast: {registeredShortcut.label}</Detail>
                        </FastFadeReveal>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
