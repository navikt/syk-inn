import { expect, Page, test } from '@playwright/test'

import { expectTermToHaveDefinitions } from '../utils/assertions'

type SectionTitle =
    | 'Sykmeldingen gjelder'
    | 'Har pasienten flere arbeidsforhold?'
    | 'Hvilke arbeidsforhold skal pasienten sykmeldes fra?'
    | 'Periode'
    | 'Perioder'
    | 'Dato for tilbakedatering'
    | 'Grunn for tilbakedatering'
    | 'Hoveddiagnose'
    | 'Til NAV'
    | 'Til arbeidsgiver'
    | 'Svangerskapsrelatert'
    | 'Yrkesskade'

interface SummarySection {
    name: SectionTitle
    values: (string | RegExp)[]
}

export function verifySummaryPage(sections: SummarySection[]) {
    return async (page: Page) => {
        await test.step('Verify summary page', async () => {
            await page.screenshot({})
            await expect(page.getByRole('heading', { name: 'Oppsummering sykmelding' })).toBeVisible()
            await expect(page.getByRole('button', { name: 'Endre' })).toBeVisible()
            await expect(page.getByText('Sykmeldingen gjelder')).toBeVisible()

            await Promise.all(
                sections.map(async (section) => {
                    await expectTermToHaveDefinitions(page, section.name, section.values)
                }),
            )
        })
    }
}
