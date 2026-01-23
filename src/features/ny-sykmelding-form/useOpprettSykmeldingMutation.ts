import { logger } from '@navikt/next-logger'
import { startTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@apollo/client/react'
import { teamLogger } from '@navikt/next-logger/team-log'

import { raise } from '@lib/ts'
import {
    AllDashboardDocument,
    InputAktivitet,
    InputTilbakedatering,
    OpprettSykmeldingDocument,
    RuleOutcomeFragment,
    OpprettSykmeldingInput,
    OpprettSykmeldingMutation,
    OpprettSykmeldingMutationVariables,
    OpprettSykmeldingMetaInput,
    PasientDocument,
} from '@queries'
import { spanBrowserAsync, withSpanBrowserAsync } from '@lib/otel/browser'
import { useAppSelector } from '@core/redux/hooks'
import { useMode } from '@core/providers/Modes'
import { NySykmeldingAktivitet, NySykmeldingTilbakedatering } from '@core/redux/reducers/ny-sykmelding'
import { NySykmeldingState } from '@core/redux/reducers/ny-sykmelding/ny-sykmelding-slice'
import { isCloud, isDemo, isE2E, isLocal } from '@lib/env'
import { createBrowserRuleOverrideHeaders } from '@dev/mock-engine/SykInnApiMockRuleMarkers'

import { useDraftId } from './draft/useDraftId'

export type UseOpprettSykmeldingMutation = {
    mutation: {
        opprettSykmelding: (
            force?: true,
        ) => ReturnType<useMutation.MutationFunction<OpprettSykmeldingMutation, OpprettSykmeldingMutationVariables>>
        result: useMutation.Result<OpprettSykmeldingMutation>
    }
}

export function useOpprettSykmeldingMutation(
    onRuleOutcome: (outcome: RuleOutcomeFragment) => void,
    ruleReset: () => void,
): UseOpprettSykmeldingMutation {
    const mode = useMode()
    const [draftId] = useDraftId()
    const router = useRouter()
    const formState = useAppSelector((state) => state.nySykmelding)
    const [mutate, result] = useMutation(OpprettSykmeldingDocument, {
        // In case user navigates back to the dashboard, refetches both new sykmeldinger and drafts
        refetchQueries: [{ query: AllDashboardDocument }, { query: PasientDocument }],
        onCompleted: (data) => {
            if (data.opprettSykmelding.__typename === 'SykmeldingFull') {
                logger.info(`Sykmelding created successfully: ${data.opprettSykmelding.sykmeldingId}`)
            } else if (data.opprettSykmelding.__typename === 'RuleOutcome') {
                logger.info(`Sykmelding got rule hit: ${data.opprettSykmelding.rule}: ${data.opprettSykmelding.status}`)
                onRuleOutcome(data.opprettSykmelding)
            } else if (data.opprettSykmelding.__typename === 'OtherSubmitOutcomes') {
                logger.info(`Sykmelding got other outcome: ${data.opprettSykmelding.cause}`)
            }
        },
    })

    const opprettSykmelding = withSpanBrowserAsync('OpprettSykmelding.submitSykmelding', async (force?: true) => {
        if (isLocal || isCloud) teamLogger.info(`(Client) Submitting values: ${JSON.stringify(formState)}`)

        try {
            const meta: OpprettSykmeldingMetaInput = {
                orgnummer: formState.behandler?.organisasjonsnummer ?? null,
                legekontorTlf: formState.behandler?.legekontorTlf ?? null,
            }
            const values = formStateToOpprettSykmeldingInput(formState)

            if (isLocal || isCloud) teamLogger.info(`(Client), mapped values: ${JSON.stringify(values)}`)

            const draftIdToUse = draftId ?? crypto.randomUUID()
            if (draftId == null) {
                logger.info(`User managed to end up on Summary without draftId, created draft id: ${draftIdToUse}`)
            }

            ruleReset()
            const createResult = await spanBrowserAsync('OpprettSykmelding.mutation', async () =>
                mutate({
                    variables: {
                        draftId: draftIdToUse,
                        meta: meta,
                        values: values,
                        force: force ?? false,
                    },
                    context: { headers: isLocal || isDemo || isE2E ? createBrowserRuleOverrideHeaders() : undefined },
                }),
            )

            startTransition(() => {
                // Don't redirect on errors
                if (createResult.error != null || createResult.data == null) return
                // Don't redirect on rule hits or missing person
                if (createResult.data.opprettSykmelding.__typename !== 'SykmeldingFull') return

                router.replace(mode.paths.kvittering(createResult.data.opprettSykmelding.sykmeldingId), {
                    scroll: true,
                })
            })

            return createResult
        } catch (e) {
            logger.error(`Sykmelding creation failed, errors ${e}`)
            throw new Error(`Sykmelding creation failed`)
        }
    })

    return { mutation: { opprettSykmelding, result } }
}

function formStateToOpprettSykmeldingInput(multiStepState: NySykmeldingState): OpprettSykmeldingInput {
    if (multiStepState.pasient == null) {
        raise('Ingen pasient')
    }

    const formState = multiStepState.values
    if (formState?.aktiviteter == null) {
        raise('Ingen aktivitet')
    }

    if (formState?.diagnose == null) {
        raise('Ingen diagnose')
    }

    return {
        arbeidsforhold: formState.arbeidsforhold?.harFlereArbeidsforhold
            ? {
                  arbeidsgivernavn:
                      formState.arbeidsforhold?.sykmeldtFraArbeidsforhold ?? raise('Mangler arbeidsforhold'),
              }
            : null,
        hoveddiagnose: {
            system: formState.diagnose.hoved.system,
            code: formState.diagnose.hoved.code,
        },
        bidiagnoser: formState.diagnose.bi.map((it) => ({
            system: it.system,
            code: it.code,
        })),
        aktivitet: formState.aktiviteter.map(aktivitetStepToInputAktivitet),
        meldinger: {
            tilNav: formState.meldinger?.showTilNav && formState.meldinger.tilNav ? formState.meldinger.tilNav : null,
            tilArbeidsgiver:
                formState.meldinger?.showTilArbeidsgiver && formState.meldinger.tilArbeidsgiver
                    ? formState.meldinger.tilArbeidsgiver
                    : null,
        },
        svangerskapsrelatert: formState.andreSporsmal?.svangerskapsrelatert ?? false,
        yrkesskade: {
            yrkesskade: formState.andreSporsmal?.yrkesskade ?? false,
            skadedato: formState.andreSporsmal?.yrkesskadeDato ?? null,
        },
        tilbakedatering: tilbakedateringStepToInputTilbakedatering(formState.tilbakedatering),
        pasientenSkalSkjermes: multiStepState.summary?.skalSkjermes ?? false,
        utdypendeSporsmal: {
            utfordringerMedArbeid: formState.utdypendeSporsmal?.utfordringerMedArbeid ?? null,
            medisinskOppsummering: formState.utdypendeSporsmal?.medisinskOppsummering ?? null,
            hensynPaArbeidsplassen: formState.utdypendeSporsmal?.hensynPaArbeidsplassen ?? null,
            sykdomsutvikling: formState.utdypendeSporsmal?.sykdomsutvikling ?? null,
            utfordringerHelsetilstand: formState.utdypendeSporsmal?.utfordringerHelsetilstand ?? null,
            behandlingOgFremtidigArbeid: formState.utdypendeSporsmal?.behandlingOgFremtidigArbeid ?? null,
            uavklarteForhold: formState.utdypendeSporsmal?.uavklarteForhold ?? null,
            forventetHelsetilstandUtvikling: formState.utdypendeSporsmal?.forventetHelsetilstandUtvikling ?? null,
            oppdatertMedisinskOppsummering: formState.utdypendeSporsmal?.oppdatertMedisinskOppsummering ?? null,
            mestringArbeidshverdag: formState.utdypendeSporsmal?.mestringArbeidshverdag ?? null,
            medisinskeHensyn: formState.utdypendeSporsmal?.medisinskeHensyn ?? null,
        },
        annenFravarsgrunn: formState.annenFravarsgrunn?.fravarsgrunn ?? null,
    } satisfies OpprettSykmeldingInput
}

function tilbakedateringStepToInputTilbakedatering(
    tilbakedatering: NySykmeldingTilbakedatering | null,
): InputTilbakedatering | null {
    if (!tilbakedatering?.fom) {
        return null
    }

    return {
        startdato: tilbakedatering.fom,
        begrunnelse: grunnToInputTilbakedateringBegrunnelse(tilbakedatering.grunn, tilbakedatering.annenGrunn),
    }
}

function grunnToInputTilbakedateringBegrunnelse(
    grunn: NySykmeldingTilbakedatering['grunn'],
    annenGrunn: string | null,
): string {
    switch (grunn) {
        case 'VENTETID_LEGETIME':
            return 'Ventetid på legetime'
        case 'MANGLENDE_SYKDOMSINNSIKT_GRUNNET_ALVORLIG_PSYKISK_SYKDOM':
            return 'Manglende sykdomsinnsikt grunnet alvorlig psykisk sykdom'
        case 'ANNET':
            if (annenGrunn == null || annenGrunn.trim() === '') {
                raise('Mangler annen grunn for tilbakedatering')
            }
            return annenGrunn
        default:
            raise(`Ukjent grunn for tilbakedatering: ${grunn}`)
    }
}

function aktivitetStepToInputAktivitet(value: NySykmeldingAktivitet): InputAktivitet {
    switch (value.type) {
        case 'AKTIVITET_IKKE_MULIG':
            return {
                type: 'AKTIVITET_IKKE_MULIG',
                fom: value.fom,
                tom: value.tom ?? raise("Aktivitet without 'tom'-date"),
                aktivitetIkkeMulig: {
                    medisinskArsak: {
                        isMedisinskArsak: value.medisinskArsak.isMedisinskArsak ?? false,
                    },
                    arbeidsrelatertArsak: {
                        isArbeidsrelatertArsak: value.arbeidsrelatertArsak.isArbeidsrelatertArsak ?? false,
                        arbeidsrelaterteArsaker: value.arbeidsrelatertArsak.arbeidsrelaterteArsaker ?? [],
                        annenArbeidsrelatertArsak: value.arbeidsrelatertArsak.annenArbeidsrelatertArsak ?? null,
                    },
                },
                avventende: null,
                gradert: null,
                behandlingsdager: null,
                reisetilskudd: null,
            } satisfies InputAktivitet
        case 'GRADERT':
            return {
                type: 'GRADERT',
                fom: value.fom,
                tom: value.tom ?? raise("Aktivitet without 'tom'-date"),
                gradert: {
                    grad: value.grad ? +value.grad : raise("Aktivitet of type GRADERT without 'grad'"),
                    // TODO: Implement in form
                    reisetilskudd: false,
                },
                aktivitetIkkeMulig: null,
                avventende: null,
                behandlingsdager: null,
                reisetilskudd: null,
            } satisfies InputAktivitet
    }
}
