import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { logger } from '@navikt/next-logger'
import { startTransition } from 'react'
import { useRouter } from 'next/navigation'

import { raise } from '@utils/ts'
import { pathWithBasePath } from '@utils/url'
import { useDataService } from '@data-layer/data-fetcher/data-provider'
import { CreatedSykmelding } from '@data-layer/resources'

import { useAppSelector } from '../../providers/redux/hooks'
import { withSpanAsync } from '../../otel/otel'

export function useNySykmeldingMutation(): UseMutationResult<CreatedSykmelding, Error, void, unknown> {
    const formState = useAppSelector((state) => state.nySykmeldingMultistep)
    const router = useRouter()
    const dataService = useDataService()
    const opprettSykmelding = useMutation<CreatedSykmelding>({
        mutationKey: ['opprett-sykmelding'],
        mutationFn: withSpanAsync('submitSykmelding', async () => {
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
                const createResult = await dataService.mutation.sendSykmelding({
                    pasient: formState.pasient.ident,
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

                return createResult
            } catch (e) {
                logger.error(`Sykmelding creation failed, errors ${e}`)
                throw new Error(`Sykmelding creation failed`)
            }
        }),
        onSuccess: (data) => {
            logger.info(`Sykmelding created successfully: ${data.sykmeldingId}`)
        },
    })

    return opprettSykmelding
}
