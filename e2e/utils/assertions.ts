/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { GraphQLRequest, TypedDocumentNode } from '@apollo/client'
import { expect, Page, test } from '@playwright/test'

export function expectGraphQLRequest(request: GraphQLRequest) {
    return {
        toBe: async <Query, Variables>(document: TypedDocumentNode<Query, Variables>, expectedVariables: Variables) => {
            const firstDefinition = document.definitions[0]
            const documentOperationName =
                firstDefinition.kind === 'OperationDefinition'
                    ? firstDefinition.name?.value
                    : 'Non-OperationDefinition, no name'

            await test.step(`Verify that the GraphQL request is ${documentOperationName} with correct payload`, () => {
                expect(request.operationName, { message: 'Verify GraphQL Document' }).toEqual(documentOperationName)
                expect(request.variables, { message: 'Verify GraphQL Variables' }).toEqual(expectedVariables)
            })
        },
    }
}

export async function expectTermToHaveDefinitions(page: Page, term: string, definitions: string[]) {
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
    for (const d of definitionElements) {
        const definitionText = await d.textContent()
        expect(definitions).toContain(definitionText)
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
