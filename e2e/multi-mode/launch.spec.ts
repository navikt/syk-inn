import test, { expect } from '@playwright/test'

import { launchMode, modes } from './modes'

modes.forEach(({ mode }) => {
    test(`${mode}: successful launch but is not a PILOT_USER should see no graphql requests @feature-toggle`, async ({
        page,
    }) => {
        const graphqlRequests: string[] = []
        page.on('request', (request) => {
            if (request.url().includes('/graphql')) {
                graphqlRequests.push(request.url())
            }
        })

        await launchMode(mode, 'noop', 'normal', {
            PILOT_USER: false,
        })(page)

        await expect(page.getByRole('dialog', { name: 'Ny sykmelding – Pilot' })).toBeVisible()
        expect(graphqlRequests.length, `Expected zero graphql requests, found: ${graphqlRequests.length}`).toBe(0)
    })
})
