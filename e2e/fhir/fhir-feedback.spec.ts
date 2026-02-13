import test, { expect, Locator, Page } from '@playwright/test'
import { inDays, inputDate } from '@lib/test/date-utils'

import { clickAndWait, waitForHttp } from '../utils/request-utils'
import { nextStep, submitSykmelding } from '../actions/user-actions'

import { launchWithMock } from './actions/fhir-actions'
import { startNewSykmelding } from './actions/fhir-user-actions'
import { verifyIsOnKvitteringPage, verifySignerendeBehandler } from './actions/fhir-user-verifications'

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

test('submitting feedback on kvittering page should work', async ({ page }) => {
    await launchWithMock('empty')(page)
    await startNewSykmelding({ name: 'Espen Eksempel', fnr: '21037712323' })(page)
    await test.step('fill only values that are not prefilled (tom, grad)', async () => {
        // Tom is not prefilled
        await page.getByRole('textbox', { name: 'Til og med' }).fill(inputDate(inDays(3)))

        // Grad is not prefilled
        await page.getByRole('textbox', { name: 'Sykmeldingsgrad (%)' }).fill(`60`)
    })
    await nextStep()(page)
    await verifySignerendeBehandler()(page)
    await submitSykmelding()(page)
    await verifyIsOnKvitteringPage()(page)

    const inSituRegion = page.getByRole('region', { name: 'Tilbakemelding' })
    await test.step('Fyll ut in-situ tilbakemelding', async () => {
        await expect(inSituRegion).toBeVisible()
        await inSituRegion.getByRole('button', { name: 'Ja takk!' }).click()
        await inSituRegion
            .getByRole('textbox', { name: /Hvordan synes du den nye løsningen fungerer/ })
            .fill('Jeg synes den fungerer bra!')

        await inSituRegion
            .getByRole('radiogroup', { name: 'Hvor fornøyd er du med den nye løsningen?' })
            .getByRole('radio', {
                name: 'Jeg er fornøyd',
            })
            .click()
    })

    await test.step('send og bekreft at det er good', async () => {
        const result = await clickAndWait(
            inSituRegion.getByRole('button', { name: 'Send tilbakemelding' }).click(),
            waitForHttp('/feedback', 'POST')(page),
        )
        await expect(inSituRegion.getByText('Tilbakemelding mottatt, tusen takk!')).toBeVisible()
        expect(await result.response().then((it) => it?.status())).toBe(200)
    })
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
            sentimentRegion
                .getByRole('radiogroup', { name: 'Hvor godt liker du å bruke den nye sykmeldingsløsningen?' })
                .getByRole('radio', { name: 'Jeg er fornøyd' })
                .click(),
            waitForHttp('/feedback', 'POST')(page),
        )
        await expect(sentimentRegion.getByText('Takk for din mening!')).toBeVisible()
        expect(await result.response().then((it) => it?.status())).toBe(200)
    }
}
