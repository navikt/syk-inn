import { expect, Page, test } from '@playwright/test'

import { expectPatient } from '../../actions/user-form-verification'
import { verifyNoHorizontalScroll } from '../../utils/assertions'

export function startNewSykmelding(patient?: { name: string; fnr: string }) {
    return async (page: Page) => {
        await test.step(
            patient == null ? 'Start new sykmelding' : 'Verify the patient and start new sykmelding',
            async () => {
                const pasientInfoRegion = page.getByRole('region', { name: /Oversikt over (.*) sitt sykefravær/ })

                if (patient != null) await expectPatient(patient)(pasientInfoRegion)

                await verifyNoHorizontalScroll()(page)

                await pasientInfoRegion.getByRole('button', { name: 'Opprett sykmelding' }).click()
            },
        )
    }
}

export function gotoExistingSykmelding(when: 'current' | 'previous', nth: number) {
    return async (page: Page) => {
        await test.step('Go to existing sykmelding', async () => {
            const region = page.getByRole('region', {
                name: when === 'current' ? 'Pågående sykmeldinger og utkast' : 'Historiske sykmeldinger',
            })

            await expect(region).toBeVisible()
            await expect(region).not.toHaveAttribute('aria-busy', 'true')

            await verifyNoHorizontalScroll()(page)

            const rows = region.getByRole('row')
            await rows.nth(nth).getByRole('link').click()

            await expect(page.getByRole('heading', { name: /Sykmelding for (.*)/ })).toBeVisible()
        })
    }
}
