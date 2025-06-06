import * as R from 'remeda'
import { differenceInSeconds, endOfDay } from 'date-fns'
import { logger } from '@navikt/next-logger'

import { getValkeyClient } from '@services/valkey/client'

type DraftOwnership = { hpr: string; ident: string }

type DraftEntryCore = {
    draftId: string
    // ISO 8601 date string
    lastUpdated: string
}

type ValkeyDraftEntry = DraftEntryCore & {
    // Stringified JSON object
    values: string
}

export type DraftEntry = DraftEntryCore & {
    // Parsed JSON object
    values: Record<string, unknown>
}

type DraftClient = {
    saveDraft: (draftId: string, owner: DraftOwnership, values: Record<string, unknown>) => Promise<void>
    deleteDraft: (draftId: string, owner: DraftOwnership) => Promise<void>
    getDraft: (draftId: string) => Promise<DraftEntry | null>
    getDrafts: (owner: DraftOwnership) => Promise<DraftEntry[]>
}

export async function getDraftClient(): Promise<DraftClient> {
    const valkey = await getValkeyClient()

    return {
        saveDraft: async (draftId, owner, values) => {
            const key = draftKey(draftId)
            const ownershipKey = ownershipIndexKey(owner)

            await valkey.hset(key, {
                draftId,
                values: JSON.stringify(values),
                lastUpdated: new Date().toISOString(),
            } satisfies ValkeyDraftEntry)
            await valkey.sadd(ownershipKey, key)

            await valkey.expire(key, getSecondsUntilMidnight())
            await valkey.expire(ownershipKey, getSecondsUntilMidnight())
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
        getDraft: async (draftId): Promise<DraftEntry | null> => {
            const value = await valkey.hgetall(draftKey(draftId))
            if (valkeyEmptyHashValueToNull(value) == null) {
                return null
            }

            return internalEntryToDraftEntry(value)
        },
        getDrafts: async (ownership) => {
            const keys = await valkey.smembers(ownershipIndexKey(ownership))
            if (keys.length === 0) {
                return []
            }

            const drafts = await Promise.all(keys.map((key) => valkey.hgetall(key)))

            return (
                drafts
                    .map(valkeyEmptyHashValueToNull)
                    // Removes keys that valkey returned as {}
                    .filter(R.isNonNull)
                    .map(internalEntryToDraftEntry)
                    // Removes potentials broken drafts
                    .filter(R.isNonNull)
            )
        },
    }
}

function internalEntryToDraftEntry(value: Record<string, string>): DraftEntry | null {
    if (!value.draftId || !value.lastUpdated || !value.values) {
        logger.warn(
            `Found incomplete draft object, draftId: ${!!value.draftId}, lastUpdated: ${!!value.lastUpdated}, values: ${!!value.values}`,
        )
        return null
    }

    return {
        draftId: value.draftId,
        lastUpdated: value.lastUpdated,
        values: JSON.parse(value.values),
    } satisfies DraftEntry
}

function valkeyEmptyHashValueToNull(value: Record<string, string>): Record<string, string> | null {
    return Object.keys(value).length === 0 ? null : value
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
