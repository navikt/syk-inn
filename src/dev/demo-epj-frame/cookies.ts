import { cookies } from 'next/headers'

export async function getDemoFrameEnabled(): Promise<boolean> {
    const cookieStore = await cookies()

    return cookieStore.get('syk-inn-demo-frame')?.value === 'true'
}
