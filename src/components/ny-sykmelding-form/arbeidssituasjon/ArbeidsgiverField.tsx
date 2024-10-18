import React, { PropsWithChildren, ReactElement } from 'react'

import ArbeidssituasjonField from '@components/ny-sykmelding-form/arbeidssituasjon/ArbeidssituasjonField'

import { useFormContext } from '../NySykmeldingFormValues'

import ArbeidstakerManuellInputSection from './ArbeidsgiverManuellInputSection'

function ArbeidsgiverField({ children }: PropsWithChildren): ReactElement {
    const { watch } = useFormContext()
    const type = watch('arbeidssituasjon.situasjon')

    return (
        <div>
            {children}
            <ArbeidssituasjonField />
            {type !== 'ingen' && <ArbeidstakerManuellInputSection />}
        </div>
    )
}

export default ArbeidsgiverField
