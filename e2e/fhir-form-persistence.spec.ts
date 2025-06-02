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

    // Section 1 - Periode/Aktiviteter
    // TODO: Multiple periods?
    const periodeRegion = page.getByRole('region', { name: 'Sykmeldingsperiode' })
    await expect(periodeRegion.getByRole('textbox', { name: 'Fra og med' })).toHaveValue(inputDate(daysAgo(9)))
    await expect(periodeRegion.getByRole('textbox', { name: 'Til og med' })).toHaveValue(inputDate(inDays(5)))

    await expect(periodeRegion.getByRole('combobox', { name: 'Mulighet for arbeid' })).toHaveValue('GRADERT')
    await expect(periodeRegion.getByRole('textbox', { name: 'Sykmeldingsgrad (%)\n' })).toHaveValue('65')

    // Section 2 - Tilbakedatering
    const tilbakedateringRegion = page.getByRole('region', { name: 'Tilbakedatering' })
    await expect(tilbakedateringRegion.getByRole('textbox', { name: 'Når tok pasienten først kontakt' })).toHaveValue(
        inputDate(daysAgo(4)),
    )
    await expect(tilbakedateringRegion.getByRole('textbox', { name: 'Oppgi årsak for tilbakedatering' })).toHaveValue(
        'Han ringte men fikk ikke time',
    )

    // Section 3 - Diagnoser
    const diagnoseRegion = page.getByRole('region', { name: 'Diagnose', exact: true })
    const hoveddiagnose = diagnoseRegion.getByRole('region', { name: 'Hoveddiagnose', exact: true })
    await expect(hoveddiagnose).toHaveText(/P74 - Angstlidelse/)

    // Section 4 - Andre spørsmål
    const andreSporsmalRegion = page.getByRole('region', { name: 'Andre spørsmål' })
    await expect(andreSporsmalRegion.getByRole('checkbox', { name: 'Sykdommen er svangerskapsrelatert' })).toBeChecked()
    await expect(
        andreSporsmalRegion.getByRole('checkbox', { name: 'Sykmeldingen kan skyldes en yrkesskade/yrkessykdom' }),
    ).toBeChecked()

    // Section 5 - Meldinger
    const meldingerRegion = page.getByRole('region', { name: 'Meldinger' })
    await expect(meldingerRegion.getByRole('button', { name: 'Vis mer' })).toHaveAttribute('aria-expanded', 'true')
    await expect(meldingerRegion.getByRole('textbox', { name: 'Har du noen tilbakemeldinger?' })).toHaveValue(
        'Trenger mer penger',
    )
    await expect(meldingerRegion.getByRole('textbox', { name: 'Innspill til arbeidsgiver' })).toHaveValue(
        'Trenger sev-henk pult',
    )
})
