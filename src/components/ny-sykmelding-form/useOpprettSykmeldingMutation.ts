import { logger } from '@navikt/next-logger'
import { startTransition } from 'react'
import { useRouter } from 'next/navigation'
import { MutationResult, useMutation } from '@apollo/client'

import { raise } from '@utils/ts'
import { pathWithBasePath } from '@utils/url'
import { OpprettSykmeldingDocument } from '@queries'
import { withSpanAsync } from '@otel/otel'

import { useAppSelector } from '../../providers/redux/hooks'
import { useMode } from '../../providers/ModeProvider'

export function useOpprettSykmeldingMutation(): {
    opprettSykmelding: () => Promise<unknown>
    result: MutationResult<unknown>
} {
    const mode = useMode()
    const router = useRouter()
    const formState = useAppSelector((state) => state.nySykmeldingMultistep)
    const [mutate, result] = useMutation(OpprettSykmeldingDocument, {
        onCompleted: (data) => {
            logger.info(`Sykmelding created successfully: ${data.opprettSykmelding.sykmeldingId}`)
        },
    })

    const opprettSykmelding = withSpanAsync('submitSykmelding', async () => {
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
            const createResult = await mutate({
                variables: {
                    values: {
                        pasientIdent: formState.pasient.ident,
                        hoveddiagnose: {
                            system: formState.diagnose.hoved.system,
                            code: formState.diagnose.hoved.code,
                        },
                        perioder: formState.aktiviteter.map((aktivitet) => ({
                            type: aktivitet.type,
                            fom: aktivitet.fom,
                            tom: aktivitet.tom,
                            grad: aktivitet.grad ? `${aktivitet.grad}` : null,
                        })),
                        // TODO: Meldinger
                    },
                },
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
