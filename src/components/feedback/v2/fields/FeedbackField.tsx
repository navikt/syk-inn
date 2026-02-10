import React, { ReactElement } from 'react'
import { Textarea } from '@navikt/ds-react'
import { useController } from 'react-hook-form'

import { FeedbackFormValues, useFeedbackContext } from '../form'

export function FeedbackField(): ReactElement {
    const message = useController<FeedbackFormValues, 'message'>({
        name: 'message',
        rules: {
            required: 'Du må skrive en liten tekst for å gi oss tilbakemelding!',
        },
    })
    const { watch } = useFeedbackContext()
    const type = watch('type')

    return (
        <Textarea
            {...message.field}
            error={message.fieldState.error?.message}
            description="Husk å ikke dele noe personidentifiserende informasjon med oss gjennom tilbakemeldingsskjemaet. Vi tar kontakt dersom vi trenger det."
            label={getHeadingForFeedbackType(type)}
            maxLength={500}
        ></Textarea>
    )
}

function getHeadingForFeedbackType(type: string): string {
    switch (type) {
        case 'FEIL':
            return 'Hva er feilen du opplevde?'
        case 'FORSLAG':
            return 'Hva er forslaget du vil dele?'
        default:
            return 'Hva er tilbakemeldingen eller spørsmålet ditt?'
    }
}
