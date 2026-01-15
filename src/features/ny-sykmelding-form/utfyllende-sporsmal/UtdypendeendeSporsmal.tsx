import { ReactElement } from 'react'
import { BodyShort, Textarea } from '@navikt/ds-react'

import FormSection from '@components/form/form-section/FormSection'
import { useController, useFormContext } from '@features/ny-sykmelding-form/form/types'
import { shouldShowUke7Sporsmal } from '@features/ny-sykmelding-form/utfyllende-sporsmal/utdypende-sporsmal-utils'
import { UtdypendeOpplysningerHint } from '@data-layer/graphql/generated/resolvers.generated'

const getTitleForUtdypendeSporsmal = (skalViseSporsmal: { uke7: boolean; uke17: boolean; uke39: boolean }): string => {
    if (skalViseSporsmal.uke39) return 'Utdypende spørsmål uke 40'
    if (skalViseSporsmal.uke17) return 'Utdypende spørsmål uke 18'
    if (skalViseSporsmal.uke7) return 'Utdypende spørsmål uke 8'
    return ''
}

export function UtdypendeSporsmal({
    utdypendeSporsmal,
}: {
    utdypendeSporsmal?: UtdypendeOpplysningerHint | null
}): ReactElement | null {
    const perioder = useFormContext().watch('perioder')

    if (!utdypendeSporsmal) return null

    const skalViseSporsmalForUke = {
        uke7: shouldShowUke7Sporsmal(perioder, utdypendeSporsmal),
        uke17: false, // shouldShowUke17Sporsmal(perioder, utdypendeSporsmal),
        uke39: false, // shouldShowUke39Sporsmal(perioder, utdypendeSporsmal),
    }

    const visUtdypendeSporsmal = Object.values(skalViseSporsmalForUke).some((it) => it === true)

    if (visUtdypendeSporsmal) {
        return (
            <FormSection title={getTitleForUtdypendeSporsmal(skalViseSporsmalForUke)}>
                <BodyShort spacing>Helseopplysninger i Navs vurdering av aktivitetskrav og oppfølging</BodyShort>
                {skalViseSporsmalForUke.uke7 && <Uke7 />}
            </FormSection>
        )
    }

    return null
}

function Uke7(): ReactElement {
    const utfordringerMedArbeid = useController({
        name: 'utdypendeSporsmal.utfordringerMedArbeid',
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
        <>
            <Textarea
                label="Gi en kort medisinsk oppsummering av tilstanden (sykehistorie, hovedsymptomer, behandling)"
                onChange={medisinskOppsummering.field.onChange}
                value={medisinskOppsummering.field.value ?? ''}
                error={medisinskOppsummering.fieldState.error?.message}
            />
            <Textarea
                label="Beskriv kort hvilke helsemessige begrensninger som gjør det vanskelig å jobbe gradert"
                onChange={utfordringerMedArbeid.field.onChange}
                value={utfordringerMedArbeid.field.value ?? ''}
                error={utfordringerMedArbeid.fieldState.error?.message}
            />

            <Textarea
                label="Beskriv eventuelle medisinske forhold som bør ivaretas ved eventuell tilbakeføring til nåværende arbeid (ikke obligatorisk)"
                onChange={hensynPaArbeidsplassen.field.onChange}
                value={hensynPaArbeidsplassen.field.value ?? ''}
                error={hensynPaArbeidsplassen.fieldState.error?.message}
            />
        </>
    )
}
