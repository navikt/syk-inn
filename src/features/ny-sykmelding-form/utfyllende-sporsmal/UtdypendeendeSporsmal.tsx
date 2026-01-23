import { ReactElement } from 'react'
import { BodyShort, Select, Textarea } from '@navikt/ds-react'

import FormSection from '@components/form/form-section/FormSection'
import { useController, useFormContext } from '@features/ny-sykmelding-form/form/types'
import {
    shouldShowUke17Sporsmal,
    shouldShowUke39Sporsmal,
    shouldShowUke7Sporsmal,
} from '@features/ny-sykmelding-form/utfyllende-sporsmal/utdypende-sporsmal-utils'
import { UtdypendeOpplysningerHint } from '@data-layer/graphql/generated/resolvers.generated'
import { utdypendeSporsmalTekster } from '@features/ny-sykmelding-form/utfyllende-sporsmal/utdypende-sporsmal-tekster'

export function UtdypendeSporsmal({
    utdypendeSporsmal,
}: {
    utdypendeSporsmal?: UtdypendeOpplysningerHint | null
}): ReactElement | null {
    const perioder = useFormContext().watch('perioder')

    if (!utdypendeSporsmal) return null

    if (shouldShowUke39Sporsmal(perioder, utdypendeSporsmal)) {
        return <Uke39 />
    }

    if (shouldShowUke17Sporsmal(perioder, utdypendeSporsmal)) {
        return <Uke17 />
    }
    if (shouldShowUke7Sporsmal(perioder, utdypendeSporsmal)) {
        return <Uke7 />
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
        <FormSection title="Utdypende spørsmål uke 8">
            <BodyShort spacing>Helseopplysninger i Navs vurdering av aktivitetskrav og oppfølging</BodyShort>
            <Textarea
                label={utdypendeSporsmalTekster.medisinskOppsummering}
                onChange={medisinskOppsummering.field.onChange}
                value={medisinskOppsummering.field.value ?? ''}
                error={medisinskOppsummering.fieldState.error?.message}
            />
            <Textarea
                label={utdypendeSporsmalTekster.utfordringerMedArbeid}
                onChange={utfordringerMedArbeid.field.onChange}
                value={utfordringerMedArbeid.field.value ?? ''}
                error={utfordringerMedArbeid.fieldState.error?.message}
            />

            <Textarea
                label={utdypendeSporsmalTekster.hensynPaArbeidsplassen}
                onChange={hensynPaArbeidsplassen.field.onChange}
                value={hensynPaArbeidsplassen.field.value ?? ''}
                error={hensynPaArbeidsplassen.fieldState.error?.message}
            />
        </FormSection>
    )
}

function Uke17(): ReactElement {
    const sykdomsutvikling = useController({
        name: 'utdypendeSporsmal.sykdomsutvikling',
        rules: { required: 'Du må fylle ut dette feltet' },
    })

    const utfordringerHelsetilstand = useController({
        name: 'utdypendeSporsmal.utfordringerHelsetilstand',
        rules: { required: 'Du må fylle ut dette feltet' },
    })

    const behandlingOgFremtidigArbeid = useController({
        name: 'utdypendeSporsmal.behandlingOgFremtidigArbeid',
        rules: { required: 'Du må fylle ut dette feltet' },
    })

    const uavklarteForhold = useController({
        name: 'utdypendeSporsmal.uavklarteForhold',
    })

    return (
        <FormSection title="Utdypende spørsmål uke 18">
            <BodyShort spacing>Helseopplysninger i Navs vurdering av aktivitetskrav og oppfølging</BodyShort>
            <Textarea
                label={utdypendeSporsmalTekster.sykdomsutvikling}
                onChange={sykdomsutvikling.field.onChange}
                value={sykdomsutvikling.field.value ?? ''}
                error={sykdomsutvikling.fieldState.error?.message}
            />
            <Textarea
                label={utdypendeSporsmalTekster.utfordringerHelsetilstand}
                onChange={utfordringerHelsetilstand.field.onChange}
                value={utfordringerHelsetilstand.field.value ?? ''}
                error={utfordringerHelsetilstand.fieldState.error?.message}
            />
            <Textarea
                label={utdypendeSporsmalTekster.behandlingOgFremtidigArbeid}
                onChange={behandlingOgFremtidigArbeid.field.onChange}
                value={behandlingOgFremtidigArbeid.field.value ?? ''}
                error={behandlingOgFremtidigArbeid.fieldState.error?.message}
            />
            <Textarea
                label={utdypendeSporsmalTekster.uavklarteForhold}
                onChange={uavklarteForhold.field.onChange}
                value={uavklarteForhold.field.value ?? ''}
                error={uavklarteForhold.fieldState.error?.message}
            />
        </FormSection>
    )
}

function Uke39(): ReactElement {
    const oppdatertMedisinskOppsummering = useController({
        name: 'utdypendeSporsmal.oppdatertMedisinskOppsummering',
        rules: { required: 'Du må fylle ut dette feltet' },
    })

    const mestringArbeidshverdag = useController({
        name: 'utdypendeSporsmal.mestringArbeidshverdag',
        rules: { required: 'Du må fylle ut dette feltet' },
    })

    const forventetHelsetilstandUtvikling = useController({
        name: 'utdypendeSporsmal.forventetHelsetilstandUtvikling',
        rules: { required: 'Du må fylle ut dette feltet' },
    })

    const medisinskeHensyn = useController({
        name: 'utdypendeSporsmal.medisinskeHensyn',
        rules: { required: 'Du må fylle ut dette feltet' },
    })
    return (
        <FormSection title="Utdypende spørsmål uke 40">
            <BodyShort spacing>
                Gi en kort oppdatert medisinsk oppsummering relevant for sykefraværet (utvikling, hovedsymptomer og
                relevante funn)
            </BodyShort>
            <Textarea
                label={utdypendeSporsmalTekster.oppdatertMedisinskOppsummering}
                onChange={oppdatertMedisinskOppsummering.field.onChange}
                value={oppdatertMedisinskOppsummering.field.value ?? ''}
                error={oppdatertMedisinskOppsummering.fieldState.error?.message}
            />
            <Textarea
                label={utdypendeSporsmalTekster.mestringArbeidshverdag}
                onChange={mestringArbeidshverdag.field.onChange}
                value={mestringArbeidshverdag.field.value ?? ''}
                error={mestringArbeidshverdag.fieldState.error?.message}
            />
            <Select
                label={utdypendeSporsmalTekster.forventetHelsetilstandUtvikling}
                onChange={forventetHelsetilstandUtvikling.field.onChange}
                value={forventetHelsetilstandUtvikling.field.value ?? ''}
                error={forventetHelsetilstandUtvikling.fieldState.error?.message}
            >
                <option value="">Velg</option>
                <option value="Forventet bedring - økt arbeidsdeltakelse realistisk">
                    Forventet bedring - økt arbeidsdeltakelse realistisk
                </option>
                <option value="Gradvis bedring - omfang usikkert">Gradvis bedring - omfang usikkert</option>
                <option value="Lite endring forventes">Lite endring forventes</option>
                <option value="Uavklart - avhenger av pågående avklaring/behandling">
                    Uavklart - avhenger av pågående avklaring/behandling
                </option>
            </Select>
            <Textarea
                label={utdypendeSporsmalTekster.medisinskeHensyn}
                onChange={medisinskeHensyn.field.onChange}
                value={medisinskeHensyn.field.value ?? ''}
                error={medisinskeHensyn.fieldState.error?.message}
            />
        </FormSection>
    )
}
