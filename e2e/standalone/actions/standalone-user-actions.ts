import test, { expect, Page } from '@playwright/test'

export function searchPerson(ident: string) {
    return async (page: Page) => {
        await page.getByRole('searchbox', { name: 'Finn pasient' }).fill(ident)
        await page.getByRole('button', { name: 'Søk' }).click()
    }
}

export function startNewSykmelding(ident: string) {
    return async (page: Page) => {
        const link = page.getByRole('link', { name: /Opprett sykmelding for/ })

        await expect(link).toBeVisible()
        await expect(link.locator(':scope + *'), `Ident for searched user matches ${ident}`).toHaveText(ident)
        await link.click()
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
