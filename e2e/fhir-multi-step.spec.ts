import { test, expect } from '@playwright/test'

import { ExpectedToggles } from '@toggles/toggles'

import { launchWithMock } from './actions/fhir-actions'
import { pickHoveddiagnose } from './actions/user-actions'
import { clickAndWait, waitForHttp } from './utils/request-utils'

test('can submit 100% sykmelding (multi step)', async ({ page, context }) => {
    await context.addCookies([
        // Enable multi-step form feature toggle
        {
            name: 'SYK_INN_MULTISTEP_FORM_V1' satisfies ExpectedToggles,
            value: 'true',
            domain: 'localhost',
            path: '/',
        },
    ])
    await launchWithMock(page)

    await expect(page.getByRole('heading', { name: 'Sykmelding for Espen Eksempel' })).toBeVisible()
    await expect(page.getByText(/ID-nummer(.*)21037712323/)).toBeVisible()

    await page.getByRole('button', { name: 'Start sykmelding' }).click()

    await page.getByRole('textbox', { name: 'Fra og med' }).fill('15.02.2024')
    await page.getByRole('textbox', { name: 'Til og med' }).fill('18.02.2024')

    await page.getByRole('button', { name: 'Neste steg' }).click()

    await pickHoveddiagnose({ search: 'Angst', select: /Angstlidelse/ })(page)

    await page.getByRole('button', { name: 'Neste steg' }).click()

    const request = await clickAndWait(
        page.getByRole('button', { name: 'Send inn' }).click(),
        waitForHttp('/fhir/resources/sykmelding/submit', 'POST')(page),
    )
    const payload = request.postDataJSON()

    expect(payload).toEqual({
        behandlerHpr: '9144889',
        values: {
            pasient: '21037712323',
            diagnoser: {
                hoved: { code: 'P74', system: 'ICPC2' },
            },
            aktivitet: {
                type: 'AKTIVITET_IKKE_MULIG',
                fom: '2024-02-15',
                tom: '2024-02-18',
            },
        },
    })

    await expect(page.getByRole('heading', { name: 'Kvittering på innsendt sykmelding' })).toBeVisible()
})
