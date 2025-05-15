import React, { PropsWithChildren, ReactElement } from 'react'
import { ExpansionCard } from '@navikt/ds-react'

import { cleanId } from '@utils/string'

type Props = {
    title: string
    defaultClosed?: true
}

function ExpandableFormSection({ title, children, defaultClosed }: PropsWithChildren<Props>): ReactElement {
    const cardTitleId = `expandable-form-section-${cleanId(title)}`

    return (
        <ExpansionCard size="small" aria-labelledby={cardTitleId} defaultOpen={!defaultClosed}>
            <ExpansionCard.Header>
                <ExpansionCard.Title id={cardTitleId}>{title}</ExpansionCard.Title>
            </ExpansionCard.Header>
            <ExpansionCard.Content>{children}</ExpansionCard.Content>
        </ExpansionCard>
    )
}

export default ExpandableFormSection
