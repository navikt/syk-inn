import type { CodegenConfig } from '@graphql-codegen/cli'

const oxlintDisabler = { add: { content: '/* oxlint-disable */' } }

const config: CodegenConfig = {
    schema: './src/core/data-layer/graphql/schema/**/*.graphqls',
    documents: ['./src/core/data-layer/graphql/queries/**/*.graphql'],
    generates: {
        './src/core/data-layer/graphql/generated/queries.generated.ts': {
            plugins: [oxlintDisabler, 'typescript', 'typescript-operations', 'typed-document-node'],
            config: {
                enumsAsTypes: true,
                avoidOptionals: true,
                scalars: { DateTime: 'string', DateOnly: 'string', JSON: 'unknown' },
                nonOptionalTypename: true,
            },
        },
        './src/core/data-layer/graphql/generated/resolvers.generated.ts': {
            plugins: [oxlintDisabler, 'typescript', 'typescript-resolvers'],
            config: {
                enumsAsTypes: true,
                scalars: { DateTime: 'string', DateOnly: 'string', JSON: 'unknown' },
            },
        },
        './src/core/data-layer/graphql/generated/possible-types.generated.ts': {
            plugins: ['fragment-matcher'],
        },
        './src/core/data-layer/graphql/generated/schema.generated.json': {
            plugins: ['introspection'],
            config: {
                minify: true,
            },
        },
    },
    hooks: {
        afterOneFileWrite: ['oxfmt'],
        afterAllFileWrite: ['oxfmt'],
    },
}
export default config
