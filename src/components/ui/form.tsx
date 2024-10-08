import { PropsWithChildren, ReactElement } from 'react'
import { Heading } from '@navikt/ds-react'

type Props = {
    title: string
}

export function FormSection({ children, title }: PropsWithChildren<Props>): ReactElement {
    return (
        <section className="p-4 bg-bg-subtle rounded">
            <Heading level="2" size="medium">
                {title}
            </Heading>
            {children}
        </section>
    )
}
