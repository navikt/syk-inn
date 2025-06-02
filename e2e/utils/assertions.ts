/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { GraphQLRequest, TypedDocumentNode } from '@apollo/client'
import { expect } from '@playwright/test'

export function expectGraphQLRequest(request: GraphQLRequest) {
    return {
        toBe: <Query, Variables>(document: TypedDocumentNode<Query, Variables>, expectedVariables: Variables) => {
            const firstDefinition = document.definitions[0]
            const documentOperationName =
                firstDefinition.kind === 'OperationDefinition'
                    ? firstDefinition.name?.value
                    : 'Non-OperationDefinition, no name'

            expect(request.operationName, { message: 'Verify GraphQL Document' }).toEqual(documentOperationName)
            expect(request.variables, { message: 'Verify GraphQL Variables' }).toEqual(expectedVariables)
        },
    }
}
