import { defineConfig, devices, PlaywrightTestConfig } from '@playwright/test'

const PORT = process.env.PORT || 3000

type OptionsType = { baseURL: string; timeout: number; server: PlaywrightTestConfig['webServer'] | undefined }
const opts: OptionsType = process.env.CI
    ? {
          baseURL: `http://localhost:3000`,
          timeout: 30 * 1000,
          // Uses service container app
          server: undefined,
      }
    : process.env.FAST
      ? {
            baseURL: `http://localhost:${PORT}`,
            timeout: 30 * 1000,
            server: {
                command: 'yarn start:e2e',
                url: `http://localhost:${PORT}`,
                timeout: 120 * 1000,
                reuseExistingServer: false,
                stderr: 'pipe',
                stdout: 'pipe',
            },
        }
      : // Local dev server
        {
            baseURL: `http://localhost:${PORT}`,
            timeout: 120 * 2 * 1000,
            server: {
                command: 'NEXT_PUBLIC_RUNTIME_ENV=e2e yarn dev --turbo',
                url: `http://localhost:${PORT}`,
                timeout: 120 * 1000,
                reuseExistingServer: true,
                stderr: 'pipe',
                stdout: 'pipe',
            },
        }

export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: process.env.CI ? 'blob' : 'html',
    timeout: opts.timeout,
    use: {
        baseURL: opts.baseURL,
        trace: 'on-first-retry',
    },
    webServer: opts.server,
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },

        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },
    ],
})
