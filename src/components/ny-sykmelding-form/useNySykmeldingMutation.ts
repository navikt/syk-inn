import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { logger } from '@navikt/next-logger'
import { startTransition } from 'react'
import { useRouter } from 'next/navigation'

import { getTracer } from '@faro/faro'
import { raise } from '@utils/ts'
import { pathWithBasePath } from '@utils/url'

import { useDataService } from '../../data-fetcher/data-provider'
import { useAppSelector } from '../../providers/redux/hooks'
import { NySykmelding } from '../../data-fetcher/data-service'

export function useNySykmeldingMutation(): UseMutationResult<NySykmelding, Error, void, unknown> {
    const formState = useAppSelector((state) => state.nySykmeldingMultistep)
    const router = useRouter()
    const dataService = useDataService()
    const opprettSykmelding = useMutation({
        mutationKey: ['opprett-sykmelding'],
        mutationFn: async () => {
            logger.info('(Client) Submitting values,', formState)

            if (formState.pasient == null) {
                raise('Ingen pasient')
            }

            if (formState.aktiviteter == null) {
                raise('Ingen aktivitet')
            }

            if (formState.diagnose == null) {
                raise('Ingen diagnose')
            }

            try {
                const span = getTracer()?.startSpan('opprettSykmelding')

                const createResult = await dataService.mutation.sendSykmelding({
                    pasient: formState.pasient.fnr,
                    aktivitet: {
                        type: formState.aktiviteter[0].type,
                        fom: formState.aktiviteter[0].fom,
                        tom: formState.aktiviteter[0].tom,
                        // @ts-expect-error TODO proper mapping
                        grad: formState.aktiviteter[0].grad,
                    },

                    diagnoser: {
                        hoved: {
                            system: formState.diagnose.hoved.system,
                            code: formState.diagnose.hoved.code,
                        },
                    },
                    // TODO: Meldinger
                })

                startTransition(() => {
                    // Nuke the history, so that browser back takes the user to a fresh form
                    window.history.replaceState(null, '', pathWithBasePath('/fhir'))

                    router.push(
                        `/${dataService.mode === 'fhir' ? 'fhir' : 'ny'}/kvittering/${createResult.sykmeldingId}`,
                    )
                })

                span?.end()

                return createResult
            } catch (e) {
                logger.error(`Sykmelding creation failed, errors ${e}`)
                throw new Error(`Sykmelding creation failed`)
            }
        },
        onSuccess: (data) => {
            logger.info(`Sykmelding created successfully: ${data.sykmeldingId}`)
        },
    })

    return opprettSykmelding
}
