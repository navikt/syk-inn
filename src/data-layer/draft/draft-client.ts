import { differenceInSeconds, endOfDay } from 'date-fns'

import { getValkeyClient } from '@services/valkey/client'

type DraftOwnership = { hpr: string; ident: string }

type DraftClient = {
    saveDraft: (draftId: string, owner: DraftOwnership, values: Record<string, unknown>) => Promise<void>
    deleteDraft: (draftId: string, owner: DraftOwnership) => Promise<void>
    getDraft: (draftId: string) => Promise<unknown>
    getDrafts: (owner: DraftOwnership) => Promise<{ draftId: string; values: unknown }[]>
}

export async function getDraftClient(): Promise<DraftClient> {
    const valkey = await getValkeyClient()

    return {
        saveDraft: async (draftId, owner, values) => {
            const key = draftKey(draftId)

            await valkey.set(key, JSON.stringify(values))
            await valkey.sadd(ownershipIndexKey(owner), key)

            await valkey.expire(key, getSecondsUntilMidnight())
        },
        deleteDraft: async (draftId, owner) => {
            const key = draftKey(draftId)
            const ownershipKey = ownershipIndexKey(owner)

            // Does document even exist?
            const exists = await valkey.exists(key)
            if (exists !== 1) return

            // If the ownership is not in the index, it's not this users draft
            const isMember = await valkey.sismember(ownershipKey, key)
            if (isMember !== 1) {
                throw new Error(`Draft with ID ${draftId} does not belong to ownership ${owner.hpr}`)
            }

            await valkey.del(key)
            await valkey.srem(ownershipKey, key)
        },
        getDraft: async (draftId): Promise<unknown | null> => {
            const value = await valkey.get(draftKey(draftId))
            if (value == null) {
                return null
            }
            return JSON.parse(value)
        },
        getDrafts: async (ownership) => {
            const keys = await valkey.smembers(ownershipIndexKey(ownership))
            if (keys.length === 0) {
                return []
            }

            const drafts = await valkey.mget(...keys)

            return (
                drafts
                    .map((values, index) => ({
                        draftId: keys[index].replace('draft:', ''),
                        values: values ? JSON.parse(values) : null,
                    }))
                    // Drafts without value are stale values in the secondary index
                    .filter((it) => it.values != null)
            )
        },
    }
}

function getSecondsUntilMidnight(): number {
    const now = new Date()

    return differenceInSeconds(endOfDay(now), new Date())
}

function draftKey(draftId: string): `draft:${string}` {
    return draftId.startsWith('draft:') ? (draftId as `draft:${string}`) : `draft:${draftId}`
}

function ownershipIndexKey({ hpr, ident }: DraftOwnership): `ownership:hpr:${string}:ident:${string}` {
    return `ownership:hpr:${hpr}:ident:${ident}`
}
