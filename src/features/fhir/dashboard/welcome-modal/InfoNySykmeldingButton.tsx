import React, { ReactElement } from 'react'
import { InformationSquareIcon } from '@navikt/aksel-icons'
import { Button } from '@navikt/ds-react'

import { metadataActions } from '@core/redux/reducers/metadata'
import { useAppDispatch } from '@core/redux/hooks'

export function InfoNySykmeldingButton(): ReactElement {
    const dispatch = useAppDispatch()

    return (
        <Button
            icon={<InformationSquareIcon title="Se informasjon om pilot" className="size-5" />}
            className="rounded-full h-fit"
            variant="secondary"
            size="small"
            onClick={() => dispatch(metadataActions.openWelcome())}
        />
    )
}
