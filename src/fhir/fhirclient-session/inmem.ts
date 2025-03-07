import { ServerStorage } from '@navikt/fhirclient-next'

export class FhirClientSessionInMem implements ServerStorage {
    private _sessions: Record<string, unknown> = {}

    async set(key: string, value: unknown): Promise<void> {
        this._sessions[key] = value
    }

    async get(key: string): Promise<unknown> {
        return this._sessions[key]
    }

    async unset(key: string): Promise<boolean> {
        if (this._sessions[key]) {
            delete this._sessions[key]
            return true
        }
        return false
    }
}
