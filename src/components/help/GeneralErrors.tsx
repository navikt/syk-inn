import React, { ReactElement } from 'react'
import { BodyShort, Button, LocalAlert } from '@navikt/ds-react'

import LegeOgBehandlerTelefonen from '@components/help/LegeOgBehandlerTelefonen'
import SessionIdInfo from '@components/help/SessionIdInfo'

export function UnknownSystemError({ className, retry }: { className?: string; retry?: () => void }): ReactElement {
    return (
        <LocalAlert status="error" className={className}>
            <LocalAlert.Header>
                <LocalAlert.Title>Ukjent systemfeil</LocalAlert.Title>
            </LocalAlert.Header>
            <LocalAlert.Content>
                <BodyShort spacing>
                    Vi opplever litt problemer akkurat nå, og våre systemer klarte ikke å gjøre jobben sin.
                </BodyShort>
                {retry && (
                    <Button size="small" variant="secondary-neutral" onClick={() => retry()} className="mb-2">
                        Prøv på nytt
                    </Button>
                )}
                <LegeOgBehandlerTelefonen />
                <SessionIdInfo />
            </LocalAlert.Content>
        </LocalAlert>
    )
}

type AlertProps = {
    title: string
    level: 'warning' | 'error'
    size?: 'small' | 'medium'
    className?: string
    retry?: () => void
    noCallToAction?: true
    noSessionId?: true
}

/**
 * An alert with a single line error/warning message
 */
export function SimpleAlert({ children, ...rest }: AlertProps & { children: string }): ReactElement {
    return (
        <DetailedAlert {...rest}>
            <BodyShort spacing>{children}</BodyShort>
        </DetailedAlert>
    )
}

/**
 * A detailed alert with a more complex description.
 */
export function DetailedAlert({
    className,
    title,
    children,
    level = 'error',
    size = 'medium',
    retry,
    noCallToAction = undefined,
    noSessionId = undefined,
}: AlertProps & { children: ReactElement | Iterable<ReactElement> }): ReactElement {
    return (
        <LocalAlert status={level} className={className} size={size}>
            <LocalAlert.Header>
                <LocalAlert.Title>{title}</LocalAlert.Title>
            </LocalAlert.Header>
            <LocalAlert.Content>
                {children}
                {retry && (
                    <Button size="small" variant="secondary-neutral" onClick={() => retry()} className="mb-2">
                        Prøv på nytt
                    </Button>
                )}
                {noCallToAction !== true && <LegeOgBehandlerTelefonen />}
                {noSessionId !== true && <SessionIdInfo />}
            </LocalAlert.Content>
        </LocalAlert>
    )
}

export function InlineWarning({ title, size = 'medium' }: { title: string; size?: 'small' | 'medium' }): ReactElement {
    return (
        <LocalAlert status="warning" size={size}>
            <LocalAlert.Header>
                <LocalAlert.Title>{title}</LocalAlert.Title>
            </LocalAlert.Header>
        </LocalAlert>
    )
}
