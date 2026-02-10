import React, { ReactElement } from 'react'
import { useController } from 'react-hook-form'
import { ToggleGroup } from '@navikt/ds-react'
import { BugIcon, LightBulbIcon, QuestionmarkIcon } from '@navikt/aksel-icons'

import { FeedbackFormValues } from '../form'

export function TypeField(): ReactElement {
    const type = useController<FeedbackFormValues, 'type'>({
        name: 'type',
    })

    return (
        <ToggleGroup
            label="Hva vil du dele?"
            defaultValue="lest"
            {...type.field}
            className="w-full [&>.aksel-toggle-group]:w-full"
        >
            <ToggleGroup.Item value="FEIL" icon={<BugIcon aria-hidden />} label="En feil" />
            <ToggleGroup.Item value="FORSLAG" icon={<LightBulbIcon aria-hidden />} label="Et forslag" />
            <ToggleGroup.Item value="ANNET" icon={<QuestionmarkIcon aria-hidden />} label="Noe annet" />
        </ToggleGroup>
    )
}
