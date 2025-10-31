import test, { expect } from '@playwright/test'

import { launchPath, launchWithMock } from './actions/fhir-actions'

test('launching with an unknown issuer should not work', async ({ page }) => {
    await page.goto(
        `${launchPath}?iss=https://syk-inn.ekstern.dev.nav.no/samarbeidspartner/sykmelding/api/mocks/fhir&launch=demo-param`,
    )

    await expect(page.getByRole('heading', { name: 'Ugyldig utsteder' })).toBeVisible()
})

test('successful launch but is not a PILOT_USER should see no graphql requests @feature-toggle', async ({ page }) => {
    const graphqlRequests: string[] = []
    page.on('request', (request) => {
        if (request.url().includes('/graphql')) {
            graphqlRequests.push(request.url())
        }
    })

    await launchWithMock('normal', { PILOT_USER: false })(page)

    await expect(page.getByRole('dialog', { name: 'Ny sykmelding – Pilot' })).toBeVisible()
    expect(graphqlRequests.length, `Expected zero graphql requests, found: ${graphqlRequests.length}`).toBe(0)
})
