import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        setupFiles: ['./vitest.setup.mts'],
        include: ['src/**/*.test.ts'],
        alias: {
            '@utils/**': './src/utils',
        },
        reporters: ['default', 'json'],
        outputFile: {
            json: 'test-results/vitest-report.json',
        },
    },
    resolve: {
        alias: {
            // Required to fix multi-realm issues in tests, see: https://github.com/vitest-dev/vitest/issues/4605
            'graphql/execution': 'graphql/execution/index.js',
            graphql: 'graphql/index.js',
        },
    },
})
