/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { ApolloLink, TypedDocumentNode } from '@apollo/client'
import { expect, Locator, Page, test } from '@playwright/test'

export function expectGraphQLRequest(request: ApolloLink.Request) {
    return {
        toBe: async <Query, Variables>(document: TypedDocumentNode<Query, Variables>, expectedVariables: Variables) => {
            const firstDefinition = document.definitions[0]
            const documentOperationName =
                firstDefinition.kind === 'OperationDefinition'
                    ? firstDefinition.name?.value
                    : 'Non-OperationDefinition, no name'

            await test.step(`Verify that the GraphQL request is ${documentOperationName} with correct payload`, () => {
                if (!('operationName' in request)) {
                    fail("Request does not have an 'operationName' property")
                }
                expect(request.operationName, { message: 'Verify GraphQL Document' }).toEqual(documentOperationName)
                expect(request.variables, { message: 'Verify GraphQL Variables' }).toEqual(expectedVariables)
            })
        },
    }
}

export async function expectTermToHaveDefinitions(
    page: Page | Locator,
    term: string,
    definitions: (string | RegExp)[],
) {
    const terms = await page.getByRole('term').all()

    let termElement
    for (const t of terms) {
        const textContent = await t.textContent()
        if (term === textContent) {
            termElement = t
            break
        }
    }

    if (!termElement) {
        fail(`Term "${term}" not found in the document.`)
    }

    const definitionElements = await termElement.locator('~ dd').all()

    expect(
        definitionElements.length,
        `Found ${definitionElements.length} definitions, expected ${definitions.length} for term "${term}"`,
    ).toEqual(definitions.length)

    for (const dd of definitionElements) {
        const definitionText = await dd.textContent()
        const match = definitions.find((expectedDefinition) => {
            if (typeof expectedDefinition === 'string') {
                return definitionText?.includes(expectedDefinition)
            } else {
                return definitionText?.match(expectedDefinition)
            }
        })
        if (!match) {
            fail(
                `Definition "${definitionText}" for term "${term}" does not match any of the expected definitions: ${definitions}`,
            )
        }
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function anything<T>(): any {
    return expect.anything() as T
}

export function fail(message: string): never {
    expect(true, message).toBe(false)
    return void 0 as never
}
