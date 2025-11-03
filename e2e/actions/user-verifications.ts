import { expect, Page, test } from '@playwright/test'

import { SaveDraftDocument } from '@queries'

import { expectTermToHaveDefinitions } from '../utils/assertions'
import { waitForGqlRequest } from '../utils/request-utils'

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

            /**
             * Hackyness part 2: See comment below
             */
            await waitForGqlRequest(SaveDraftDocument)(page)

            await expect(oppsummeringSection).toBeVisible()
            await expect(oppsummeringSection).not.toHaveAttribute('aria-busy', 'true')
            await expect(oppsummeringSection.getByRole('button', { name: 'Endre svar' })).toBeVisible()
            await expect(oppsummeringSection.getByText('Sykmeldingen gjelder')).toBeVisible()

            await Promise.all(
                sections.map(async (section) => {
                    /*
                        This is quite hacky, playwright is so fast that the draft query kicks off after the
                        initial render of the summary (and URL gets a draftId), which causes the loading state
                        to kick-in again.

                        TODO: We should have a look at the draft synchronization implementation to see if we can
                        avoid this awkward flash of loading state twice.
                     */
                    await expect(oppsummeringSection).not.toHaveAttribute('aria-busy', 'true')
                    await expectTermToHaveDefinitions(oppsummeringSection, section.name, section.values)
                }),
            )
        })
    }
}
