import { test, expect } from '@playwright/test'
import { addDays } from 'date-fns'

import { dateOnly } from '@utils/date'

import { launchStandalone } from './actions/standalone-actions'
import { fillPeriodeRelative, fillManualPasient, pickHoveddiagnose, submitSykmelding } from './actions/user-actions'

test.fixme('can submit 100% sykmelding without prefilled pasient', async ({ page }) => {
    await launchStandalone(page)
    await fillManualPasient({ fnr: '21037712323' })(page)
    await pickHoveddiagnose({ search: 'Angst', select: /Angstlidelse/ })(page)
    await fillPeriodeRelative({
        type: '100%',
        days: 3,
    })(page)

    const payload = await submitSykmelding()(page)
    expect(payload).toEqual({
        values: {
            pasient: '21037712323',
            diagnoser: {
                hoved: { code: 'P74', system: 'ICPC2', text: 'Angstlidelse' },
            },
            aktivitet: {
                type: 'AKTIVITET_IKKE_MULIG',
                fom: dateOnly(new Date()),
                tom: dateOnly(addDays(new Date(), 3)),
                grad: null,
            },
        },
    })
})
