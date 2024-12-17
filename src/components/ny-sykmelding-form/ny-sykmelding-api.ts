import { logger } from '@navikt/next-logger'

import { NySykmeldingFormValues } from '@components/ny-sykmelding-form/NySykmeldingFormValues'

type CreateResult = { ok: 'ok'; id: string } | { errors: { message: string } }[]

export async function createSykmelding(
    values: NySykmeldingFormValues,
    behandler: {
        hpr: string
    },
): Promise<CreateResult> {
    const response = await fetch('/api/sykmelding/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            values,
            behandlerHpr: behandler.hpr,
        }),
    })

    if (!response.ok) {
        const errors = await response.json()
        logger.error(errors)
        return [{ errors: { message: 'Server error' } }]
    }

    return response.json()
}
