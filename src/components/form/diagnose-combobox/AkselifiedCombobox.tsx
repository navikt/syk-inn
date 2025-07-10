import React, { PropsWithChildren, ReactElement } from 'react'
import * as Combobox from '@ariakit/react/combobox'
import { Label, Loader } from '@navikt/ds-react'
import cn from 'clsx'

import styles from './AkselifiedCombobox.module.css'

interface Props {
    className?: string
    labelId?: string
    label: string
    disabled?: boolean
}

export function AkselifiedComboboxWrapper({
    className,
    labelId,
    label,
    disabled,
    children,
    ...rest
}: PropsWithChildren<Props & Combobox.ComboboxProviderProps>): ReactElement {
    return (
        <div
            className={cn('navds-combobox__wrapper navds-form-field navds-form-field--medium', className, {
                'navds-combobox--disabled': disabled,
            })}
        >
            <Label id={labelId}>{label}</Label>
            <Combobox.ComboboxProvider {...rest}>{children}</Combobox.ComboboxProvider>
        </div>
    )
}

export function AkselifiedComboboxDisclosure({ loading }: { loading?: boolean }): ReactElement {
    return (
        <Combobox.ComboboxDisclosure
            className={styles.disclosure}
            render={(props) => {
                if (loading) {
                    return (
                        <div {...props}>
                            <Loader size="xsmall" />
                        </div>
                    )
                }
                return <div {...props} />
            }}
        />
    )
}

export function AkselifiedCombobox({
    className,
    children,
    error,
    ...props
}: PropsWithChildren<Combobox.ComboboxProps & { error?: string | undefined }>): ReactElement {
    return (
        <div
            className={cn('navds-select__container', {
                'navds-text-field--error': error != null,
            })}
        >
            {children}
            <Combobox.Combobox
                {...props}
                className={cn(
                    className,
                    styles.combobox,
                    'navds-text-field__input navds-body-short navds-body-medium pr-10',
                )}
            />
        </div>
    )
}

export function AkselifiedComboboxPopover({
    children,
    ...props
}: PropsWithChildren<Combobox.ComboboxPopoverProps>): ReactElement {
    return (
        <Combobox.ComboboxPopover gutter={8} sameWidth className="navds-combobox__list" {...props}>
            {children}
        </Combobox.ComboboxPopover>
    )
}

export function AkselifiedComboboxItem({
    children,
    className,
    ...props
}: PropsWithChildren<Combobox.ComboboxItemProps>): ReactElement {
    return (
        <Combobox.ComboboxItem {...props} className={cn('navds-combobox__list-item', styles.comboboxItem, className)}>
            {children}
        </Combobox.ComboboxItem>
    )
}

export function AkselifiedComboboxNonInteractiveFeedbackItem({
    children,
    className,
}: PropsWithChildren<{
    className?: string
}>): ReactElement {
    return <div className={cn('p-2 text-text-subtle', className)}>{children}</div>
}

export function AkselifiedComboboxLoading(): ReactElement {
    return (
        <div className="navds-combobox__list-item--loading">
            <Loader size="xsmall" title="Søker..." />
        </div>
    )
}

export function AkselifiedComboboxNonSelectables({ children }: PropsWithChildren): ReactElement {
    return (
        <div className="navds-combobox__list_non-selectables" role="status">
            {children}
        </div>
    )
}

export { useComboboxStore } from '@ariakit/react/combobox'
export { useStoreState } from '@ariakit/react'
