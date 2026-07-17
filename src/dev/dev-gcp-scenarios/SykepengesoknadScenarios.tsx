import { Detail, Heading, LinkCard } from '@navikt/ds-react'
import { subDays } from 'date-fns'
import { useRouter } from 'next/navigation'
import React, { ReactElement } from 'react'

import { HelseIdPaths } from '#core/providers/ModePaths'
import { useAppDispatch } from '#core/redux/hooks'
import { NySykmeldingFormPayload } from '#core/redux/reducers/ny-sykmelding/form'
import { nySykmeldingSlice } from '#core/redux/reducers/ny-sykmelding/ny-sykmelding-slice'
import { FORM_VARIANT_KEY, NySykmeldingFormVariantType } from '#features/ny-sykmelding-form/useFormVariant'
import { dateOnly } from '#lib/date'

import { scenarioPeriode } from './date'

export function SykepengesoknadScenarios(): ReactElement {
    return (
        <div className="mt-4">
            <Heading size="xsmall" level="3">
                Scenarioer for sykepengesøknader
            </Heading>
            <Detail className="italic">
                Forhåndsdefinerte scenarioer som vil generere opp en sykepengesøknad med en gang. Dette betyr at til og
                med dato er i fortiden.
            </Detail>
            <div className="mt-2 gap-1 grid grid-cols-2">
                {sykepengesoknadScenarios.map((scenario) => (
                    <ScenarioButton key={scenario.title} {...scenario} />
                ))}
            </div>
        </div>
    )
}

function ScenarioButton({ title, description, payload, goto }: SykepengesoknadScenario): ReactElement {
    const router = useRouter()
    const dispatch = useAppDispatch()
    return (
        <LinkCard size="small" className="shrink">
            <LinkCard.Title>
                <LinkCard.Anchor href="/eksempel" asChild>
                    <button
                        onClick={() => {
                            dispatch(nySykmeldingSlice.actions.overrideBehandlerOrganisasjonsnummmer('123456789'))
                            dispatch(nySykmeldingSlice.actions.overrideBehandlerLegekontorTlf('+47 12345678'))
                            dispatch(nySykmeldingSlice.actions.completeForm(payload))

                            switch (goto) {
                                case 'ny':
                                    router.push(HelseIdPaths.ny)
                                    break
                                case 'behandlingsdager':
                                    router.push(
                                        `${HelseIdPaths.ny}?${FORM_VARIANT_KEY}=${'BEHANDLINGSDAGER' satisfies NySykmeldingFormVariantType}`,
                                    )
                                    break
                                case 'reisetilskudd':
                                    router.push(
                                        `${HelseIdPaths.ny}?${FORM_VARIANT_KEY}=${'REISETILSKUDD' satisfies NySykmeldingFormVariantType}`,
                                    )
                                    break
                            }
                        }}
                    >
                        {title}
                    </button>
                </LinkCard.Anchor>
            </LinkCard.Title>
            <LinkCard.Description>{description}</LinkCard.Description>
        </LinkCard>
    )
}

interface SykepengesoknadScenario {
    title: string
    description: string
    payload: NySykmeldingFormPayload
    goto: 'ny' | 'behandlingsdager' | 'reisetilskudd'
}

const defaultArbeidsrelatertArsak = {
    isArbeidsrelatertArsak: false,
    arbeidsrelaterteArsaker: null,
    annenArbeidsrelatertArsak: null,
}

const sykepengesoknadScenarios: SykepengesoknadScenario[] = [
    {
        title: 'Innenfor AGP',
        description: 'Periode under 17 dager',
        goto: 'ny',
        payload: createPayload([
            {
                type: 'AKTIVITET_IKKE_MULIG',
                ...scenarioPeriode(15, -1),
                arbeidsrelatertArsak: defaultArbeidsrelatertArsak,
            },
        ]),
    },
    {
        title: 'Utenfor AGP',
        description: 'Periode over 16 dager',
        goto: 'ny',
        payload: createPayload([
            {
                type: 'AKTIVITET_IKKE_MULIG',
                ...scenarioPeriode(17, -1),
                arbeidsrelatertArsak: defaultArbeidsrelatertArsak,
            },
        ]),
    },
    {
        title: 'Ikke tilbakedatering',
        description: 'Kort nok periode så den ikke er tilbakedatert',
        goto: 'ny',
        payload: createPayload([{ type: 'GRADERT', grad: 80, ...scenarioPeriode(4, -1), reisetilskudd: false }]),
    },
    {
        title: 'Gradert',
        description: 'Sykmelding med gradert fravær',
        goto: 'ny',
        payload: createPayload([{ type: 'GRADERT', grad: 80, ...scenarioPeriode(14, -1), reisetilskudd: false }]),
    },
    {
        title: 'Gradert ulikt',
        description: 'Sykmelding med ulik grad i forskjellige perioder',
        goto: 'ny',
        payload: createPayload([
            { type: 'GRADERT', grad: 40, ...scenarioPeriode(7, -8), reisetilskudd: false },
            { type: 'GRADERT', grad: 70, ...scenarioPeriode(7, -1), reisetilskudd: false },
        ]),
    },
    {
        title: 'Behandlingsdager',
        description: 'Sykmelding med behandlingsdager',
        goto: 'behandlingsdager',
        payload: createPayload([{ type: 'BEHANDLINGSDAGER', ...scenarioPeriode(7, -1) }]),
    },
    {
        title: 'Reisetilskudd',
        description: 'Sykmelding med reisetilskudd',
        goto: 'reisetilskudd',
        payload: createPayload([{ type: 'REISETILSKUDD', ...scenarioPeriode(14, -1) }]),
    },
    {
        title: 'Reisetilskudd (gradert)',
        description: 'Sykmelding med gradert reisetilskudd',
        goto: 'reisetilskudd',
        payload: createPayload([{ type: 'GRADERT', reisetilskudd: true, grad: 80, ...scenarioPeriode(14, -1) }]),
    },
]

function createPayload(
    aktiviteter: NySykmeldingFormPayload['aktiviteter'],
    overrides?: Partial<Omit<NySykmeldingFormPayload, 'aktiviteter'>>,
): NySykmeldingFormPayload {
    const fom = dateOnly(subDays(new Date(), 10))

    return {
        diagnose: {
            hoved: { code: 'L73', system: 'ICPC2', text: 'Brudd legg/ankel' },
            bi: [],
        },
        aktiviteter: aktiviteter,
        tilbakedatering: {
            fom: fom,
            grunn: 'VENTETID_LEGETIME',
            annenGrunn: null,
        },
        arbeidsforhold: {
            harFlereArbeidsforhold: false,
            sykmeldtFraArbeidsforhold: null,
        },
        meldinger: {
            showTilNav: false,
            showTilArbeidsgiver: false,
            tilNav: null,
            tilArbeidsgiver: null,
        },
        andreSporsmal: {
            svangerskapsrelatert: false,
            yrkesskade: false,
            yrkesskadeDato: null,
        },
        annenFravarsgrunn: {
            harFravarsgrunn: false,
            fravarsgrunn: null,
        },
        utdypendeSporsmal: null,
        ...overrides,
    }
}
