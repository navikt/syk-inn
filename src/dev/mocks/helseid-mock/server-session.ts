import { HelseIdBehandler, MockBehandlere } from './data/behandlere'
import { createAccessToken, createIdToken } from './jwt/jwt'

export type HelseIdTokens = {
    accessToken: string
    idToken: string
}

type UserSession = {
    tokens: HelseIdTokens
}

export class HelseIdMockSession {
    private behandlerMagnar: [MockBehandlere, HelseIdBehandler] = [
        'Magnar Koman',
        { pid: '01010112345', hpr: '9144889', name: 'Magnar Koman' },
    ]

    private sessions: Record<string, UserSession> = {}

    public async initUser(sessionId: string): Promise<UserSession> {
        const accessToken = await createAccessToken('syk-inn', crypto.randomUUID())
        const idToken = await createIdToken(this.behandlerMagnar[1])

        this.sessions[sessionId] = {
            tokens: {
                accessToken: accessToken,
                idToken: idToken,
            },
        }

        return this.sessions[sessionId]
    }

    public getTokens(sessionId: string): HelseIdTokens {
        const session = this.sessions[sessionId]
        if (!session) {
            throw new Error(`No session found for sessionId: ${sessionId}`)
        }
        return session.tokens
    }

    public dump(): unknown {
        return { sessions: this.sessions }
    }
}
