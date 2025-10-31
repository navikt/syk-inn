import { Page, test } from '@playwright/test'

import { expectPatient } from '../../actions/user-form-verification'

export function startNewSykmelding(patient?: { name: string; fnr: string }) {
    return async (page: Page) => {
        await test.step(
            patient == null ? 'Start new sykmelding' : 'Verify the patient and start new sykmelding',
            async () => {
                const pasientInfoRegion = page.getByRole('region', { name: /Oversikt over (.*) sitt sykefravær/ })

                if (patient != null) await expectPatient(patient)(pasientInfoRegion)

                await pasientInfoRegion.getByRole('button', { name: 'Opprett sykmelding' }).click()
            },
        )
    }
}
