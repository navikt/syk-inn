import React, { PropsWithChildren, ReactElement, useCallback, useRef } from 'react'
import { Button, ButtonProps, Detail } from '@navikt/ds-react'
import { useRouter } from 'next/navigation'
import { AnimatePresence } from 'motion/react'

import AssableNextLink from '@components/misc/AssableNextLink'
import { FastFadeReveal } from '@components/animation/Reveal'

import { Shortcut, useShortcut } from '../../lib/shortcuts/useShortcut'
import { useCurrentModifier } from '../../lib/shortcuts/useCurrentModifier'

type BaseShortcutButtonProps = {
    shortcut: Shortcut
} & Pick<ButtonProps, 'id' | 'loading' | 'size' | 'variant' | 'disabled' | 'icon' | 'iconPosition'>

export function ShortcutButton({
    onClick,
    children,
    shortcut,
    ...buttonProps
}: PropsWithChildren<BaseShortcutButtonProps & { onClick: () => void }>): ReactElement {
    const registeredShortcut = useShortcut(shortcut, () => {
        if (buttonProps.disabled) return
        onClick()
    })
    const currentMod = useCurrentModifier()

    return (
        <div className="relative">
            <Button type="button" onClick={() => onClick()} {...buttonProps}>
                {children}
            </Button>
            <div className="absolute -bottom-5 right-2 text-text-action">
                <AnimatePresence>
                    {currentMod === shortcut.modifier && (
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
        <div className="relative">
            <Button as={AssableNextLink} type="button" href={href} {...buttonProps}>
                {children}
            </Button>
            <div className="absolute -bottom-5 right-2 text-text-action">
                <AnimatePresence>
                    {currentMod === shortcut.modifier && (
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
        <div className="relative">
            <Button ref={buttonRef} type="submit" {...buttonProps}>
                {children}
            </Button>
            <div className="absolute -bottom-5 right-2 text-text-action">
                <AnimatePresence>
                    {currentMod === shortcut.modifier && (
                        <FastFadeReveal>
                            <Detail className="font-bold">Hurtigtast: {registeredShortcut.label}</Detail>
                        </FastFadeReveal>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
