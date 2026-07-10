import { InformationSquareIcon } from '@navikt/aksel-icons'
import { Button } from '@navikt/ds-react'
import React, { ReactElement } from 'react'

import { useAppDispatch } from '#core/redux/hooks'
import { metadataActions } from '#core/redux/reducers/metadata'
import { cn } from '#lib/tw'

export function InfoNySykmeldingButton({ className }: { className?: string }): ReactElement {
    const dispatch = useAppDispatch()

    return (
        <Button
            icon={<InformationSquareIcon title="Se informasjon om pilot" className="size-5" />}
            className={cn('rounded-full h-fit', className)}
            variant="secondary"
            size="small"
            onClick={() => dispatch(metadataActions.openWelcome())}
        />
    )
}
