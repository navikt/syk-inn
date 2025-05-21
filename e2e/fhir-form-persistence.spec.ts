import { test, expect } from '@playwright/test'

import { launchWithMock } from './actions/fhir-actions'
import { daysAgo, inDays, inputDate } from './utils/date-utils'
import {
    initPreloadedPatient,
    pickHoveddiagnose,
    fillPeriodeRelative,
    fillTilbakedatering,
    fillAndreSporsmal,
    fillMeldinger,
    nextStep,
    previousStep,
} from './actions/user-actions'

test('filling out the form, and returning to main step, should keep all values', async ({ page }) => {
    await launchWithMock(page)
    await initPreloadedPatient({ name: 'Espen Eksempel', fnr: '21037712323' })(page)

    await fillPeriodeRelative({
        type: { grad: 65 },
        fromRelative: -9,
        days: 14,
    })(page)

    await fillTilbakedatering({
        contact: daysAgo(4),
        reason: 'Han ringte men fikk ikke time',
    })(page)

    await pickHoveddiagnose({
        search: 'Angst',
        select: /Angstlidelse/,
    })(page)

    await fillAndreSporsmal({
        svangerskapsrelatert: true,
        yrkesskade: true,
    })(page)

    await fillMeldinger({
        tilNav: 'Trenger mer penger',
        tilArbeidsgiver: 'Trenger sev-henk pult',
    })(page)

    await nextStep()(page)

    await expect(page.getByRole('heading', { name: 'Oppsummering sykmelding' })).toBeVisible()

    await previousStep()(page)

    // Warning: Highly coupled form assertions ahead
    const periodeRegion = page.getByRole('region', { name: 'Sykmeldingsperiode' })
    await expect(periodeRegion.getByRole('textbox', { name: 'Fra og med' })).toHaveValue(inputDate(daysAgo(9)))
    await expect(periodeRegion.getByRole('textbox', { name: 'Til og med' })).toHaveValue(inputDate(inDays(5)))

    await expect(
        periodeRegion
            .getByRole('group', { name: 'Aktivitetsbegrensning' })
            .getByRole('radio', { name: /Noe mulighet for aktivitet/ }),
    ).toBeChecked()
    await expect(periodeRegion.getByRole('spinbutton', { name: 'Sykmeldingsgrad' })).toHaveValue('65')

    // TODO: Multiple periods?
    // TODO: Tilbakedatering
    // TODO: Diagnose
    // TODO: Andre sporsmal
    // TODO: Meldinger
})
