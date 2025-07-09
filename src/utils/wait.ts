import { bundledEnv } from '@utils/env'

export async function wait(ms = 500, jitter = 300): Promise<void> {
    if (
        bundledEnv.runtimeEnv === 'e2e' ||
        bundledEnv.runtimeEnv === 'dev-gcp' ||
        bundledEnv.runtimeEnv === 'prod-gcp'
    ) {
        return
    }

    await new Promise((resolve) => setTimeout(resolve, ms + Math.floor(Math.random() * jitter * 2 - jitter)))
}
