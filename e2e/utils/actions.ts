import { Locator, Page } from '@playwright/test'

type CurriedAction = (page: Page) => Promise<void> | Promise<Locator> | Promise<unknown>

export function userInteractionsGroup(...actions: CurriedAction[]) {
    return async (page: Page): Promise<void> => {
        for (const action of actions) {
            await action(page)
        }
    }
}

export async function wait(ms = 100, jitter = 30): Promise<number> {
    const time = ms + Math.floor(Math.random() * jitter * 2 - jitter)
    await new Promise((resolve) => setTimeout(resolve, time))
    return time
}
