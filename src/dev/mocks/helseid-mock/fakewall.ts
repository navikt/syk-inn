import { getServerSession } from './config'
import { HelseIdTokens } from './server-session'

export function sessionToTokens(sessionId: string): HelseIdTokens {
    const serverSession = getServerSession()

    return serverSession.getTokens(sessionId)
}
