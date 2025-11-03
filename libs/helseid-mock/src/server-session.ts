import { createAccessToken, createIdToken } from './jwt/jwt'
import { HelseIdBehandler, MockBehandlere } from './data/behandlere'

export type HelseIdTokens = {
    accessToken: string
    idToken: string
}

type UserSession = {
    tokens: HelseIdTokens
}

export class HelseIdMockSession {
    private behandlere: [MockBehandlere, HelseIdBehandler][] = [
        ['Johan Johansson', { pid: '01010112345', hpr: '123456', name: 'Johan Johansson' }],
        ['Kari Karlsen', { pid: '02020212345', hpr: '654321', name: 'Kari Karlsen' }],
        ['Ola Olsen', { pid: '03030312345', hpr: '112233', name: 'Ola Olsen' }],
    ]

    private sessions: Record<string, UserSession> = {}

    public async initUser(sessionId: string, behandler: MockBehandlere): Promise<UserSession> {
        const behandlerInfo = this.behandlere.find(([name]) => name === behandler)
        if (!behandlerInfo) throw new Error(`Behandler not found: ${behandler}`)

        const accessToken = await createAccessToken('syk-inn', crypto.randomUUID())
        const idToken = await createIdToken(behandlerInfo[1])

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
