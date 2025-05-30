import { Page, Request } from '@playwright/test'

export function waitForHttp(url: string, method: string) {
    return async (page: Page): Promise<Request> => {
        return await page.waitForRequest((req) => {
            return req.url().includes(url) && req.method() === method
        })
    }
}

export async function waitForGraphQL(page: Page): Promise<Request> {
    return await page.waitForRequest((req) => {
        return req.url().includes('/graphql') && req.method() === 'POST'
    })
}

export async function clickAndWait(
    click: Promise<void>,
    waiter: ReturnType<ReturnType<typeof waitForHttp>>,
): Promise<Request> {
    const [clicked, request] = await Promise.allSettled([click, waiter])

    if (clicked.status === 'rejected') {
        throw clicked.reason
    }
    if (request.status === 'rejected') {
        throw request.reason
    }

    return request.value
}
