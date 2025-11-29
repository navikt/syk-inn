import { defineConfig, devices, PlaywrightTestConfig } from '@playwright/test'

const PORT = process.env.PORT || 3000

type WebServer = Exclude<NonNullable<PlaywrightTestConfig['webServer']>, unknown[]>

type OptionsType = {
    baseURL: string
    timeout: number
    workers: number | undefined
    server: WebServer | undefined
}

const opts: OptionsType = process.env.CI
    ? ({
          baseURL: `http://localhost:3000`,
          timeout: 30 * 1000,
          workers: 1,
          // Uses service container app
          server: undefined,
      } satisfies OptionsType)
    : process.env.FAST
      ? ({
            baseURL: `http://localhost:${PORT}`,
            timeout: 30 * 1000,
            // Uses 50% of the available CPU cores
            workers: undefined,
            server: {
                command: 'yarn server:start',
                url: `http://localhost:${PORT}/api/internal/is_alive`,
                timeout: 120 * 1000,
                reuseExistingServer: false,
                stderr: 'pipe',
                stdout: 'pipe',
            },
        } satisfies OptionsType)
      : // Local dev server
        ({
            baseURL: `http://localhost:${PORT}`,
            timeout: 60 * 1000,
            // Multiple tests in UI mode is pointless :D
            workers: 1,
            server: {
                command: 'NEXT_PUBLIC_RUNTIME_ENV=e2e yarn server:dev',
                url: `http://localhost:${PORT}/api/internal/is_ready`,
                timeout: 120 * 1000,
                reuseExistingServer: true,
                stderr: 'pipe',
                stdout: 'pipe',
            },
        } satisfies OptionsType)

export default defineConfig({
    testDir: './',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    reporter: process.env.CI ? 'blob' : 'html',
    workers: opts.workers,
    timeout: opts.timeout,
    use: {
        baseURL: opts.baseURL,
        trace: 'on-first-retry',
        contextOptions: { reducedMotion: 'reduce' },
    },
    expect: {
        timeout: !process.env.CI ? 10_000 : undefined,
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
        {
            name: 'Pixel 7',
            use: { ...devices['Pixel 7'] },
        },
    ],
})
