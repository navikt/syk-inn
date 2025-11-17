import test, { expect, Page } from '@playwright/test'

export function searchPerson(ident: string) {
    return async (page: Page) => {
        await test.step(`Search for for ${ident}`, async () => {
            await page.getByRole('searchbox', { name: 'Finn pasient' }).fill(ident)
            await page.getByRole('button', { name: 'Søk' }).click()
        })
    }
}

export function startNewSykmelding(ident: string) {
    return async (page: Page) => {
        await test.step(`Start new sykmelding for ${ident}`, async () => {
            const link = page.getByRole('link', { name: /Opprett sykmelding for/ })

            await expect(link).toBeVisible()
            await expect(link.locator(':scope + *'), `Ident for searched user matches ${ident}`).toHaveText(ident)
            await link.click()
        })
    }
}

export function continueDraft(ident: string, nth: number = 0) {
    return async (page: Page) => {
        await test.step(`Continue draft for ${ident}`, async () => {
            const link = page.getByRole('link', { name: new RegExp(`Fortsett utkast for ${ident}`) })

            await expect(link).toBeVisible()
            await link.nth(nth).click()
        })
    }
}

export function fillOrgnummer(orgnummer: string) {
    return async (page: Page) => {
        await test.step('Fill orgnummer', async () => {
            await page.getByRole('textbox', { name: 'Organisasjonsnummer ' }).fill(orgnummer)
            await page.keyboard.press('Enter')
        })
    }
}

export function fillTelefonnummer(telefonnummer: string) {
    return async (page: Page) => {
        await test.step('Fill telefonnummer', async () => {
            await page.getByRole('textbox', { name: 'Telefonnummer legekontor' }).fill(telefonnummer)
            await page.keyboard.press('Enter')
        })
    }
}
