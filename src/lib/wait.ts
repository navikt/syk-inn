import { bundledEnv } from './env'

export async function wait(ms = 500, jitter = 300): Promise<number> {
    if (
        bundledEnv.runtimeEnv === 'e2e' ||
        bundledEnv.runtimeEnv === 'dev-gcp' ||
        bundledEnv.runtimeEnv === 'prod-gcp'
    ) {
        return 0
    }

    const time = ms + Math.floor(Math.random() * jitter * 2 - jitter)
    await new Promise((resolve) => setTimeout(resolve, time))
    return time
}
