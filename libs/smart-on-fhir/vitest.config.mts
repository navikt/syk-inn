import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        setupFiles: ['src/__tests__/setup.ts'],
        include: ['src/**/*.test.ts'],
    },
})
