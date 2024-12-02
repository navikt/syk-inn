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
    },
})
