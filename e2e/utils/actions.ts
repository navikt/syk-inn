import { Locator, Page } from '@playwright/test'

type CurriedAction = (page: Page) => Promise<void> | Promise<Locator>

export function userInteractionsGroup(...actions: CurriedAction[]) {
    return async (page: Page): Promise<void> => {
        for (const action of actions) {
            await action(page)
        }
    }
}
