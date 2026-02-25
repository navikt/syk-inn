import { ReactElement } from 'react'
import { BodyShort, Radio, RadioGroup, Textarea } from '@navikt/ds-react'

import FormSection from '@components/form/form-section/FormSection'
import { useController, useFormContext } from '@features/ny-sykmelding-form/form/types'
import {
    shouldShowUke17Sporsmal,
    shouldShowUke39Sporsmal,
    shouldShowUke7Sporsmal,
} from '@features/ny-sykmelding-form/utfyllende-sporsmal/utdypende-sporsmal-utils'
import { UtdypendeOpplysningerHint } from '@data-layer/graphql/generated/resolvers.generated'
import { questionTexts } from '@data-layer/common/questions'

interface SporsmalForUke {
    uke7: boolean
    uke17: boolean
    uke39: boolean
}

const getTitleForUtdypendeSporsmal = (skalViseSporsmal: SporsmalForUke): string => {
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

    const skalViseSporsmalForUke: SporsmalForUke = {
        uke7: shouldShowUke7Sporsmal(perioder, utdypendeSporsmal),
        uke17: shouldShowUke17Sporsmal(perioder, utdypendeSporsmal),
        uke39: shouldShowUke39Sporsmal(perioder, utdypendeSporsmal),
    }

    const visUtdypendeSporsmal = Object.values(skalViseSporsmalForUke).some((it) => it === true)

    if (visUtdypendeSporsmal) {
        return (
            <FormSection title={getTitleForUtdypendeSporsmal(skalViseSporsmalForUke)}>
                <BodyShort spacing>Helseopplysninger i Navs vurdering av aktivitetskrav og oppfølging</BodyShort>
                <div className="flex flex-col gap-8">
                    <UtfordringerMedArbeid skalViseSporsmal={skalViseSporsmalForUke} />
                    <MedisinskOppsummering skalViseSporsmal={skalViseSporsmalForUke} />
                    {skalViseSporsmalForUke.uke7 && <HensynPaArbeidsplassen />}
                    {skalViseSporsmalForUke.uke17 && <BehandlingOgFremtidigArbeid />}
                    {skalViseSporsmalForUke.uke17 && <UavklarteForhold />}
                    {skalViseSporsmalForUke.uke39 && <ForventetHelsetilstandUtvikling />}
                    {skalViseSporsmalForUke.uke39 && <MedisinskeHensyn />}
                </div>
            </FormSection>
        )
    }

    return null
}

function MedisinskOppsummering({ skalViseSporsmal }: { skalViseSporsmal: SporsmalForUke }): ReactElement | null {
    if (skalViseSporsmal.uke39) return <MedisinskOppsummeringUke39 />
    if (skalViseSporsmal.uke17) return <MedisinskOppsummeringUke17 />
    if (skalViseSporsmal.uke7) return <MedisinskOppsummeringUke7 />

    return null
}

function MedisinskOppsummeringUke7(): ReactElement {
    const medisinskOppsummering = useController({
        name: 'utdypendeSporsmal.medisinskOppsummering',
        rules: { required: 'Du må fylle ut dette feltet' },
    })

    return (
        <Textarea
            label={questionTexts.utdypendeSporsmal.medisinskOppsummering.label}
            onChange={medisinskOppsummering.field.onChange}
            value={medisinskOppsummering.field.value ?? ''}
            error={medisinskOppsummering.fieldState.error?.message}
        />
    )
}

function MedisinskOppsummeringUke17(): ReactElement {
    const sykdomsutvikling = useController({
        name: 'utdypendeSporsmal.oppdatertMedisinskStatus',
        rules: { required: 'Du må fylle ut dette feltet' },
    })

    return (
        <Textarea
            label={questionTexts.utdypendeSporsmal.sykdomsutvikling.label}
            onChange={sykdomsutvikling.field.onChange}
            value={sykdomsutvikling.field.value ?? ''}
            error={sykdomsutvikling.fieldState.error?.message}
        />
    )
}

function MedisinskOppsummeringUke39(): ReactElement {
    const oppdatertMedisinskStatus = useController({
        name: 'utdypendeSporsmal.oppdatertMedisinskStatus',
        rules: { required: 'Du må fylle ut dette feltet' },
    })

    return (
        <Textarea
            label={questionTexts.utdypendeSporsmal.oppdatertMedisinskStatus.label}
            onChange={oppdatertMedisinskStatus.field.onChange}
            value={oppdatertMedisinskStatus.field.value ?? ''}
            error={oppdatertMedisinskStatus.fieldState.error?.message}
        />
    )
}

function UtfordringerMedArbeid({ skalViseSporsmal }: { skalViseSporsmal: SporsmalForUke }): ReactElement | null {
    if (skalViseSporsmal.uke39) return <UtfordringerMedArbeidUke39 />
    if (skalViseSporsmal.uke17) return <UtfordringerMedArbeidUke17 />
    if (skalViseSporsmal.uke7) return <UtfordringerMedGradertArbeid />

    return null
}

function UtfordringerMedGradertArbeid(): ReactElement {
    const utfordringerMedArbeid = useController({
        name: 'utdypendeSporsmal.utfordringerMedArbeid',
        rules: { required: 'Du må fylle ut dette feltet' },
    })

    return (
        <Textarea
            label={questionTexts.utdypendeSporsmal.utfordringerMedArbeid.label}
            onChange={utfordringerMedArbeid.field.onChange}
            value={utfordringerMedArbeid.field.value ?? ''}
            error={utfordringerMedArbeid.fieldState.error?.message}
        />
    )
}

function UtfordringerMedArbeidUke17(): ReactElement {
    const arbeidsrelaterteUtfordringer = useController({
        name: 'utdypendeSporsmal.arbeidsrelaterteUtfordringer',
        rules: { required: 'Du må fylle ut dette feltet' },
    })

    return (
        <Textarea
            label={questionTexts.utdypendeSporsmal.arbeidsrelaterteUtfordringer.label}
            description={questionTexts.utdypendeSporsmal.arbeidsrelaterteUtfordringer.description}
            onChange={arbeidsrelaterteUtfordringer.field.onChange}
            value={arbeidsrelaterteUtfordringer.field.value ?? ''}
            error={arbeidsrelaterteUtfordringer.fieldState.error?.message}
        />
    )
}

function UtfordringerMedArbeidUke39(): ReactElement {
    const realistiskMestringArbeid = useController({
        name: 'utdypendeSporsmal.realistiskMestringArbeid',
        rules: { required: 'Du må fylle ut dette feltet' },
    })

    return (
        <Textarea
            label={questionTexts.utdypendeSporsmal.realistiskMestringArbeid.label}
            description={
                <>
                    <BodyShort spacing>
                        {questionTexts.utdypendeSporsmal.realistiskMestringArbeid.descriptionSomatisk}
                    </BodyShort>
                    <BodyShort>{questionTexts.utdypendeSporsmal.realistiskMestringArbeid.descriptionPsykisk}</BodyShort>
                </>
            }
            onChange={realistiskMestringArbeid.field.onChange}
            value={realistiskMestringArbeid.field.value ?? ''}
            error={realistiskMestringArbeid.fieldState.error?.message}
        />
    )
}

function HensynPaArbeidsplassen(): ReactElement {
    const hensynPaArbeidsplassen = useController({
        name: 'utdypendeSporsmal.hensynPaArbeidsplassen',
    })

    return (
        <Textarea
            label={questionTexts.utdypendeSporsmal.hensynPaArbeidsplassen.label}
            description={questionTexts.utdypendeSporsmal.hensynPaArbeidsplassen.description}
            onChange={hensynPaArbeidsplassen.field.onChange}
            value={hensynPaArbeidsplassen.field.value ?? ''}
            error={hensynPaArbeidsplassen.fieldState.error?.message}
        />
    )
}

function BehandlingOgFremtidigArbeid(): ReactElement {
    const behandlingOgFremtidigArbeid = useController({
        name: 'utdypendeSporsmal.behandlingOgFremtidigArbeidArbeid',
        rules: { required: 'Du må fylle ut dette feltet' },
    })

    return (
        <Textarea
            label={questionTexts.utdypendeSporsmal.behandlingOgFremtidigArbeidArbeid.label}
            onChange={behandlingOgFremtidigArbeid.field.onChange}
            value={behandlingOgFremtidigArbeid.field.value ?? ''}
            error={behandlingOgFremtidigArbeid.fieldState.error?.message}
        />
    )
}

function UavklarteForhold(): ReactElement {
    const uavklarteForhold = useController({
        name: 'utdypendeSporsmal.uavklarteForhold',
        rules: { required: 'Du må fylle ut dette feltet' },
    })

    return (
        <Textarea
            label={questionTexts.utdypendeSporsmal.uavklarteForhold.label}
            onChange={uavklarteForhold.field.onChange}
            value={uavklarteForhold.field.value ?? ''}
            error={uavklarteForhold.fieldState.error?.message}
        />
    )
}

function ForventetHelsetilstandUtvikling(): ReactElement {
    const forventetHelsetilstandUtvikling = useController({
        name: 'utdypendeSporsmal.forventetHelsetilstandUtvikling',
        rules: { required: 'Du må fylle ut dette feltet' },
    })

    return (
        <RadioGroup
            legend={questionTexts.utdypendeSporsmal.forventetHelsetilstandUtvikling.label}
            onChange={forventetHelsetilstandUtvikling.field.onChange}
            value={forventetHelsetilstandUtvikling.field.value ?? ''}
            error={forventetHelsetilstandUtvikling.fieldState.error?.message}
        >
            <Radio
                value={questionTexts.utdypendeSporsmal.forventetHelsetilstandUtvikling.answerOptions.forventetBedring}
            >
                {questionTexts.utdypendeSporsmal.forventetHelsetilstandUtvikling.answerOptions.forventetBedring}
            </Radio>
            <Radio value={questionTexts.utdypendeSporsmal.forventetHelsetilstandUtvikling.answerOptions.gradvisBedring}>
                {questionTexts.utdypendeSporsmal.forventetHelsetilstandUtvikling.answerOptions.gradvisBedring}
            </Radio>
            <Radio value={questionTexts.utdypendeSporsmal.forventetHelsetilstandUtvikling.answerOptions.littEndring}>
                {questionTexts.utdypendeSporsmal.forventetHelsetilstandUtvikling.answerOptions.littEndring}
            </Radio>
            <Radio value={questionTexts.utdypendeSporsmal.forventetHelsetilstandUtvikling.answerOptions.uavklart}>
                {questionTexts.utdypendeSporsmal.forventetHelsetilstandUtvikling.answerOptions.uavklart}
            </Radio>
        </RadioGroup>
    )
}

function MedisinskeHensyn(): ReactElement {
    const medisinskeHensyn = useController({
        name: 'utdypendeSporsmal.medisinskeHensyn',
        rules: { required: 'Du må fylle ut dette feltet' },
    })

    return (
        <Textarea
            label={questionTexts.utdypendeSporsmal.medisinskeHensyn.label}
            onChange={medisinskeHensyn.field.onChange}
            value={medisinskeHensyn.field.value ?? ''}
            error={medisinskeHensyn.fieldState.error?.message}
        />
    )
}
