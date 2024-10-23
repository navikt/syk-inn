import { bundledEnv } from '@utils/env'

export async function wait(ms = 500, jitter = 300): Promise<void> {
    if (bundledEnv.NEXT_PUBLIC_RUNTIME_ENV === 'e2e') return

    await new Promise((resolve) => setTimeout(resolve, ms + Math.floor(Math.random() * jitter * 2 - jitter)))
}
