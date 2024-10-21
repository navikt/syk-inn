export async function wait(ms = 500, jitter = 300): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms + Math.floor(Math.random() * jitter * 2 - jitter)))
}
