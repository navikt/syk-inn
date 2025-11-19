import { ReactElement } from 'react'
import { BodyShort, Textarea } from '@navikt/ds-react'

import FormSection from '@components/form/form-section/FormSection'
import { useController, useFormContext } from '@features/ny-sykmelding-form/form/types'
import { shouldShowUke7Sporsmal } from '@features/ny-sykmelding-form/utfyllende-sporsmal/utdypende-sporsmal-utils'
import { UtdypendeOpplysningerHint } from '@data-layer/graphql/generated/resolvers.generated'

export function UtdypendeSporsmal({
    utdypendeSporsmal,
}: {
    utdypendeSporsmal?: UtdypendeOpplysningerHint | null
}): ReactElement | null {
    const perioder = useFormContext().watch('perioder')

    if (!utdypendeSporsmal) return null

    if (shouldShowUke7Sporsmal(perioder, utdypendeSporsmal)) {
        return <Uke7 />
    }

    return null
}

function Uke7(): ReactElement {
    const utfodringerMedArbeid = useController({
        name: 'utdypendeSporsmal.utfodringerMedArbeid',
        rules: { required: 'Du må fylle ut dette feltet' },
    })

    const medisinskOppsummering = useController({
        name: 'utdypendeSporsmal.medisinskOppsummering',
        rules: { required: 'Du må fylle ut dette feltet' },
    })

    const hensynPaArbeidsplassen = useController({
        name: 'utdypendeSporsmal.hensynPaArbeidsplassen',
    })
    return (
        <FormSection title="Utdypende spørsmål uke 8">
            <BodyShort spacing>Helseopplysninger i Navs vurdering av aktivitetskrav og oppfølging</BodyShort>
            <Textarea
                label="Hvilke utfordringer har pasienten med å utføre gradert arbeid?"
                onChange={utfodringerMedArbeid.field.onChange}
                value={utfodringerMedArbeid.field.value ?? ''}
                error={utfodringerMedArbeid.fieldState.error?.message}
            />
            <Textarea
                label="Gi en kort medisinsk oppsummering av tilstanden (sykehistorie, hovedsymptomer, pågående/planlagt behandling)"
                onChange={medisinskOppsummering.field.onChange}
                value={medisinskOppsummering.field.value ?? ''}
                error={medisinskOppsummering.fieldState.error?.message}
            />
            <Textarea
                label="Hvilke hensyn må være på plass for at pasienten kan prøves i det nåværende arbeidet? (ikke obligatorisk)"
                onChange={hensynPaArbeidsplassen.field.onChange}
                value={hensynPaArbeidsplassen.field.value ?? ''}
                error={hensynPaArbeidsplassen.fieldState.error?.message}
            />
        </FormSection>
    )
}
