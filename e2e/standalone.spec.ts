import { test, expect } from '@playwright/test'

import { launchStandalone } from './actions/standalone-actions'
import { fillAktivitetsPeriode, fillManualPasient, pickHoveddiagnose } from './actions/user-actions'
import { clickAndWait, waitForHttp } from './utils/request-utils'

test('can submit 100% sykmelding without prefilled pasient', async ({ page }) => {
    await launchStandalone(page)
    await fillManualPasient({ fnr: '21037712323' })(page)
    await pickHoveddiagnose({ search: 'Angst', select: /Angstlidelse/ })(page)
    await fillAktivitetsPeriode({
        type: '100%',
        fom: '15.02.2024',
        tom: '18.02.2024',
    })(page)

    const request = await clickAndWait(
        page.getByRole('button', { name: 'Opprett sykmelding' }).click(),
        waitForHttp('/api/sykmelding/submit', 'POST')(page),
    )

    await expect(page.getByRole('heading', { name: 'Takk for i dag' })).toBeVisible()

    const payload = request.postDataJSON()
    expect(payload).toEqual({
        behandlerHpr: '565501872',
        values: {
            pasient: '21037712323',
            diagnoser: {
                hoved: { code: 'P74', system: 'ICPC2', text: 'Angstlidelse' },
            },
            aktivitet: {
                type: 'AKTIVITET_IKKE_MULIG',
                fom: '2024-02-15',
                tom: '2024-02-18',
                grad: null,
            },
        },
    })
})
