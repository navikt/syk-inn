import { Page, Request } from '@playwright/test'

export function waitForHttp(url: string, method: string) {
    return async (page: Page): Promise<Request> => {
        return await page.waitForRequest((req) => {
            return req.url().includes(url) && req.method() === method
        })
    }
}

export async function clickAndWait(
    click: Promise<void>,
    waiter: ReturnType<ReturnType<typeof waitForHttp>>,
): Promise<Request> {
    const [, request] = await Promise.all([click, waiter])

    return request
}
