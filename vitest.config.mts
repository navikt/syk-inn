import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        setupFiles: ['./vitest.setup.mts'],
        include: ['src/**/*.test.ts'],
    },
})
