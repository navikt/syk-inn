import { Page, Request } from '@playwright/test'
import { TypedDocumentNode } from '@apollo/client'

import { fail } from './assertions'

export function getDraftId(page: Page): string | null {
    return new URL(page.url()).searchParams.get('draft') ?? null
}

export function waitForHttp(url: string, method: string) {
    return async (page: Page): Promise<Request> => {
        return await page.waitForRequest((req) => {
            return req.url().includes(url) && req.method() === method
        })
    }
}

export function waitForGqlRequest<Query, Variables>(document: TypedDocumentNode<Query, Variables>, tries = 3) {
    const firstDefinition = document.definitions[0]
    const documentOperationName =
        firstDefinition.kind === 'OperationDefinition'
            ? firstDefinition.name?.value
            : 'Non-OperationDefinition, no name'

    return async (page: Page): Promise<Request> => {
        const wrongOperations: string[] = []

        for (let i = 0; i < tries; i++) {
            const requestInQuestion = await page.waitForRequest(
                (req) => req.url().includes('/graphql') && req.method() === 'POST',
            )

            const operationName = requestInQuestion.postDataJSON().operationName
            if (operationName !== documentOperationName) {
                tries++
                wrongOperations.push(operationName)
            } else {
                return requestInQuestion
            }
        }

        fail(
            `Waited ${tries} times for the ${documentOperationName} request, never got it. But I did see ${wrongOperations.join(', ')}`,
        )
    }
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
