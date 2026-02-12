import test, { expect, Locator, Page } from '@playwright/test'

import { clickAndWait, waitForHttp } from '../utils/request-utils'

import { launchWithMock } from './actions/fhir-actions'

test('submitting feedback should work', async ({ page }) => {
    const dialog = await openFeedbackDialog()(page)
    await fillFeedbackForm({
        hva: 'En feil',
        melding: 'Dette er et forslag!! \n Det har flere linjer til og med >:(',
        kontakt: { epost: 'test@example.com' },
    })(dialog)
    await submitFeedback()(dialog)
    await answerSentiment()(dialog, page)

    await dialog.getByRole('button', { name: 'Lukk' }).nth(1).click()
})

test('submitting feedback without contact should work', async ({ page }) => {
    const dialog = await openFeedbackDialog()(page)
    await fillFeedbackForm({
        hva: 'Et forslag',
        melding: 'Dette er et forslag!! \n Det har flere linjer til og med >:(',
        kontakt: 'Nei',
    })(dialog)
    await submitFeedback()(dialog)
    await answerSentiment()(dialog, page)

    await dialog.getByRole('button', { name: 'Lukk' }).nth(0).click()
})

function openFeedbackDialog() {
    return async (page: Page): Promise<Locator> => {
        await launchWithMock('normal', {
            SYK_INN_FEEDBACK_V2: true,
        })(page)

        await page.getByRole('button', { name: 'Tilbakemelding' }).click()

        const dialog = page.getByRole('dialog', { name: 'Tilbakemelding på pilot' })
        await expect(dialog).toBeVisible()

        return dialog
    }
}

function submitFeedback() {
    return async (dialog: Locator) => {
        await dialog.getByRole('button', { name: 'Send tilbakemelding' }).click()
        await expect(dialog.getByRole('heading', { name: 'Tilbakemelding mottatt, tusen takk!' })).toBeVisible()
    }
}

function fillFeedbackForm({
    hva,
    melding,
    kontakt,
}: {
    hva: 'En feil' | 'Et forslag' | 'Annet'
    melding: string
    kontakt: 'Nei' | { epost: 'test@example.com' }
}) {
    return async (dialog: Locator) => {
        await dialog.getByRole('radiogroup', { name: 'Hva vil du dele?' }).getByRole('radio', { name: hva }).check()

        const messageTextLabel =
            hva === 'En feil'
                ? 'Hva er feilen du opplevde?'
                : hva === 'Et forslag'
                  ? 'Hva er forslaget du vil dele?'
                  : 'Hva er tilbakemeldingen eller spørsmålet ditt?'

        await dialog.getByRole('textbox', { name: messageTextLabel }).fill(melding)

        if (typeof kontakt === 'object') {
            await dialog.getByRole('combobox', { name: 'Ønsker du å bli kontaktet?' }).selectOption('Ja, via epost')
            await dialog.getByRole('textbox', { name: 'Epost vi kan kontakte deg på' }).fill(kontakt.epost)
        }
    }
}

function answerSentiment() {
    return async (dialog: Locator, page: Page) => {
        const sentimentRegion = dialog.getByRole('region', {
            name: 'Hvor godt liker du å bruke den nye sykmeldingsløsningen?',
        })
        await expect(sentimentRegion).toBeVisible()
        const result = await clickAndWait(
            sentimentRegion.getByRole('button', { name: 'Jeg er fornøyd' }).click(),
            waitForHttp('/feedback', 'POST')(page),
        )
        await expect(sentimentRegion.getByText('Takk for din mening!')).toBeVisible()
        expect(await result.response().then((it) => it?.status())).toBe(200)
    }
}
