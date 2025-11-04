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
            const oppsummeringSection = page.getByRole('region', { name: 'Oppsummering sykmelding' })

            await expect(oppsummeringSection).toBeVisible()
            await expect(oppsummeringSection).not.toHaveAttribute('aria-busy', 'true')
            await expect(oppsummeringSection.getByRole('button', { name: 'Endre svar' })).toBeVisible()
            await expect(oppsummeringSection.getByText('Sykmeldingen gjelder')).toBeVisible()

            await Promise.all(
                sections.map(async (section) => {
                    await expectTermToHaveDefinitions(oppsummeringSection, section.name, section.values)
                }),
            )
        })
    }
}
