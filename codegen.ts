import type { CodegenConfig } from '@graphql-codegen/cli'

const eslintDisabler = { add: { content: '/* eslint-disable */' } }

const config: CodegenConfig = {
    schema: './src/graphql/schema/**/*.graphqls',
    documents: ['src/graphql/queries/**/*.graphql'],
    generates: {
        './src/graphql/queries.generated.ts': {
            plugins: ['typescript', 'typescript-operations', 'typed-document-node', eslintDisabler],
        },
        './src/graphql/resolvers.generated.ts': {
            plugins: ['typescript', 'typescript-resolvers', eslintDisabler],
        },
    },
    hooks: {
        afterOneFileWrite: ['prettier --write'],
    },
}
export default config
