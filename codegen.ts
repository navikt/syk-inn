import type { CodegenConfig } from '@graphql-codegen/cli'

const eslintDisabler = { add: { content: '/* eslint-disable */' } }

const config: CodegenConfig = {
    schema: './src/core/data-layer/graphql/schema/**/*.graphqls',
    documents: ['./src/core/data-layer/graphql/queries/**/*.graphql'],
    generates: {
        './src/core/data-layer/graphql/queries.generated.ts': {
            plugins: ['typescript', 'typescript-operations', 'typed-document-node', eslintDisabler],
            config: {
                enumsAsTypes: true,
                scalars: { DateTime: 'string', DateOnly: 'string', JSON: 'unknown' },
                nonOptionalTypename: true,
            },
        },
        './src/core/data-layer/graphql/resolvers.generated.ts': {
            plugins: ['typescript', 'typescript-resolvers', eslintDisabler],
            config: {
                enumsAsTypes: true,
                scalars: { DateTime: 'string', DateOnly: 'string', JSON: 'unknown' },
            },
        },
        './src/core/data-layer/graphql/possible-types.generated.ts': {
            plugins: ['fragment-matcher'],
        },
    },
    hooks: {
        afterOneFileWrite: ['prettier --write'],
    },
}
export default config
