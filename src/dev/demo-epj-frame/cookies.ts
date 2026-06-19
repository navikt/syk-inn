import { cookies } from 'next/headers'

export const DEMO_FRAME_COOKIE_NAME = 'syk-inn-demo-frame'

export async function getDemoFrameEnabled(): Promise<boolean> {
    const cookieStore = await cookies()

    return cookieStore.get(DEMO_FRAME_COOKIE_NAME)?.value === 'true'
}
