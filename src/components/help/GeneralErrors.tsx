import React, { PropsWithChildren, ReactElement } from 'react'
import { Alert, BodyShort, Button, Heading } from '@navikt/ds-react'

import LegeOgBehandlerTelefonen from '@components/help/LegeOgBehandlerTelefonen'

export function UnknownSystemError({ className, retry }: { className?: string; retry?: () => void }): ReactElement {
    return (
        <Alert variant="error" className={className}>
            <Heading level="3" size="small" spacing>
                Ukjent systemfeil
            </Heading>
            <BodyShort spacing>
                Vi opplever litt problemer akkurat nå, og våre systemer klarte ikke å gjøre jobben sin.
            </BodyShort>
            {retry && (
                <Button size="small" variant="secondary-neutral" onClick={() => retry()} className="mb-2">
                    Prøv på nytt
                </Button>
            )}
            <LegeOgBehandlerTelefonen />
        </Alert>
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
        <Alert variant={level} className={className}>
            <Heading level="3" size="small" spacing>
                {title}
            </Heading>
            <BodyShort spacing>{children}</BodyShort>
            {retry && (
                <Button size="small" variant="secondary-neutral" onClick={() => retry()} className="mb-2">
                    Prøv på nytt
                </Button>
            )}
            {noCallToAction !== true && <LegeOgBehandlerTelefonen />}
        </Alert>
    )
}
