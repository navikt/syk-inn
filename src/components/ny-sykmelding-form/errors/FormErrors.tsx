import { ErrorSummary } from '@navikt/ds-react'
import { LegacyRef, ReactElement, useRef } from 'react'

import { useFormContext } from '../NySykmeldingFormValues'

import { extractAllErrors } from './errorUtils'

type Props = {
    ref: LegacyRef<HTMLDivElement>
}

function FormErrors({ ref }: Props): ReactElement | null {
    const {
        formState: { errors },
    } = useFormContext()

    const errorSummary = extractAllErrors(errors, null)
    if (!errorSummary.length) return null

    return (
        <ErrorSummary
            size="medium"
            heading="Du må fylle ut disse feltene før du kan registrere sykmeldingen"
            ref={ref}
            className="my-8 mx-4"
        >
            {errorSummary.map(({ name, message }) => (
                <ErrorSummary.Item key={name} href={`#${name}`}>
                    {message}
                </ErrorSummary.Item>
            ))}
        </ErrorSummary>
    )
}

export function useFormErrors(): [LegacyRef<HTMLDivElement>, () => void] {
    const errorSectionRef = useRef<HTMLDivElement>(null)
    const focusErrorSection = (): void => {
        requestAnimationFrame(() => {
            errorSectionRef.current?.focus()
        })
    }

    return [errorSectionRef, focusErrorSection] as const
}

export default FormErrors
