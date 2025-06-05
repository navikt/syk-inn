import { logger } from '@navikt/next-logger'
import { startTransition } from 'react'
import { useRouter } from 'next/navigation'
import { MutationResult, useMutation } from '@apollo/client'

import { raise } from '@utils/ts'
import { pathWithBasePath } from '@utils/url'
import { InputAktivitet, OpprettSykmeldingDocument, OpprettSykmeldingInput } from '@queries'
import { withSpanAsync } from '@otel/otel'
import { useDraftId } from '@components/ny-sykmelding-form/draft/useDraftId'

import { useAppSelector } from '../../providers/redux/hooks'
import { useMode } from '../../providers/ModeProvider'
import { AktivitetStep, NySykmeldingMultiStepState } from '../../providers/redux/reducers/ny-sykmelding-multistep'

export function useOpprettSykmeldingMutation(): {
    opprettSykmelding: () => Promise<unknown>
    result: MutationResult<unknown>
} {
    const mode = useMode()
    const draftId = useDraftId()
    const router = useRouter()
    const formState = useAppSelector((state) => state.nySykmeldingMultistep)
    const [mutate, result] = useMutation(OpprettSykmeldingDocument, {
        onCompleted: (data) => {
            logger.info(`Sykmelding created successfully: ${data.opprettSykmelding.sykmeldingId}`)
        },
    })

    const opprettSykmelding = withSpanAsync('submitSykmelding', async () => {
        logger.info('(Client) Submitting values,', formState)

        try {
            const values = formStateToOpprettSykmeldingInput(formState)

            logger.info(`(Client), mapped values: ${JSON.stringify(values)}`)

            const createResult = await mutate({
                variables: { draftId: draftId, values: values },
            })

            startTransition(() => {
                if (createResult.errors != null || createResult.data == null) return

                // Nuke the history, so that browser back takes the user to a fresh form
                window.history.replaceState(null, '', pathWithBasePath('/fhir'))

                const kvitteringUrl = `/${mode === 'FHIR' ? 'fhir' : 'ny'}/kvittering/${createResult.data.opprettSykmelding.sykmeldingId}`

                router.push(kvitteringUrl)
            })

            return createResult
        } catch (e) {
            logger.error(`Sykmelding creation failed, errors ${e}`)
            throw new Error(`Sykmelding creation failed`)
        }
    })

    return { opprettSykmelding, result }
}

function formStateToOpprettSykmeldingInput(formState: NySykmeldingMultiStepState): OpprettSykmeldingInput {
    if (formState.pasient == null) {
        raise('Ingen pasient')
    }

    if (formState.aktiviteter == null) {
        raise('Ingen aktivitet')
    }

    if (formState.diagnose == null) {
        raise('Ingen diagnose')
    }

    return {
        hoveddiagnose: {
            system: formState.diagnose.hoved.system,
            code: formState.diagnose.hoved.code,
        },
        // TODO: Implement in form
        bidiagnoser: [],
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
            // TODO: Implement in form
            skadedato: null,
        },
        // TODO: Implement in form
        arbeidsgiver: null,
        tilbakedatering: formState.tilbakedatering?.fom
            ? {
                  startdato: formState.tilbakedatering.fom,
                  begrunnelse: formState.tilbakedatering.grunn,
              }
            : null,
        // TODO: Implement in summary step (not form, see design)
        pasientenSkalSkjermes: false,
    }
}

function aktivitetStepToInputAktivitet(value: AktivitetStep): InputAktivitet {
    switch (value.type) {
        case 'AKTIVITET_IKKE_MULIG':
            return {
                type: 'AKTIVITET_IKKE_MULIG',
                fom: value.fom,
                tom: value.tom,
                aktivitetIkkeMulig: { dummy: true },
                avventende: null,
                gradert: null,
                behandlingsdager: null,
                reisetilskudd: null,
            }
        case 'GRADERT':
            return {
                type: 'GRADERT',
                fom: value.fom,
                tom: value.tom,
                gradert: {
                    grad: +value.grad,
                    // TODO: Implement in form
                    reisetilskudd: false,
                },
                aktivitetIkkeMulig: null,
                avventende: null,
                behandlingsdager: null,
                reisetilskudd: null,
            }
    }
}
