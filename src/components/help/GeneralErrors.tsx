import React, { PropsWithChildren, ReactElement } from 'react'
import { BodyShort, Button, LocalAlert } from '@navikt/ds-react'

import LegeOgBehandlerTelefonen from '@components/help/LegeOgBehandlerTelefonen'

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
            </LocalAlert.Content>
        </LocalAlert>
    )
}

export function SpecificErrorAlert({
    className,
    title,
    children,
    level = 'error',
    retry,
    noCallToAction,
}: PropsWithChildren<{
    title: string
    level?: 'warning' | 'error'
    className?: string
    retry?: () => void
    noCallToAction?: true
}>): ReactElement {
    return (
        <LocalAlert status={level} className={className}>
            <LocalAlert.Header>
                <LocalAlert.Title>{title}</LocalAlert.Title>
            </LocalAlert.Header>
            <LocalAlert.Content>
                <BodyShort spacing>{children}</BodyShort>
                {retry && (
                    <Button size="small" variant="secondary-neutral" onClick={() => retry()} className="mb-2">
                        Prøv på nytt
                    </Button>
                )}
                {noCallToAction !== true && <LegeOgBehandlerTelefonen />}
            </LocalAlert.Content>
        </LocalAlert>
    )
}
