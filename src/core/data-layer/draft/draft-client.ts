import { logger } from '@navikt/next-logger'
import { hashToRecord, toHashData, type ValkeyClient } from '@navikt/syk-zara/valkey'
import { addDays, addSeconds, differenceInSeconds, endOfDay } from 'date-fns'
import * as R from 'remeda'

import { productionValkey } from '#core/services/valkey/client'
import { mockEngineForSession, shouldUseMockEngine } from '#dev/mock-engine'
import { getServerEnv } from '#lib/env'
import { withSpanServerAsync } from '#lib/otel/server'

import { DraftValues } from './draft-schema'

export type DraftOwnership = { hpr: string; ident: string }

type DraftEntryCore = {
    draftId: string
    // ISO 8601 date string
    lastUpdated: string
    // ISO 8601 date string
    deletesAt: string
}

type ValkeyDraftEntry = DraftEntryCore & {
    // Stringified JSON object
    values: string
}

type DraftEntry = DraftEntryCore & {
    // Parsed and validated JSON object
    values: DraftValues
}

export type DraftClient = {
    saveDraft: (draftId: string, owner: DraftOwnership, values: DraftValues) => Promise<DraftValues>
    deleteDraft: (draftId: string, owner: DraftOwnership) => Promise<void>
    getDraft: (draftId: string, owner: DraftOwnership) => Promise<DraftEntry | null>
    getDrafts: (owner: DraftOwnership) => Promise<DraftEntry[]>
}

/**
 * In e2e/demo, each draft client is scoped to the users session, in production it is Valkey-backed.
 */
export async function getDraftClient(): Promise<DraftClient> {
    if (shouldUseMockEngine() && !getServerEnv().useLocalValkey) {
        const mockEngine = await mockEngineForSession()
        return mockEngine.draftClient
    }

    if (shouldUseMockEngine() && getServerEnv().useLocalValkey) {
        logger.warn('USE_LOCAL_VALKEY is enabled, using actual valkey for drafts.')
    }

    return createDraftClient(await productionValkey())
}

export function createDraftClient(valkey: ValkeyClient): DraftClient {
    return {
        saveDraft: withSpanServerAsync(
            'draft client - save draft',
            async (draftId, owner, values, lastUpdated: Date = new Date()) => {
                const key = draftKey(draftId)
                const ownershipKey = ownershipIndexKey(owner)
                const expireInSeconds = secondsToMidnightTomorrow()

                await Promise.all([
                    valkey.hset(
                        key,
                        toHashData({
                            draftId,
                            values: JSON.stringify(values),
                            lastUpdated: lastUpdated.toISOString(),
                            deletesAt: addSeconds(lastUpdated, expireInSeconds).toISOString(),
                        } satisfies ValkeyDraftEntry),
                    ),
                    valkey.sadd(ownershipKey, [key]),
                ])

                // EXPIRE requires the keys to exist, so this has to happen after the writes above
                await Promise.all([valkey.expire(key, expireInSeconds), valkey.expire(ownershipKey, expireInSeconds)])

                return values
            },
        ),
        deleteDraft: withSpanServerAsync('draft client - delete draft', async (draftId, owner) => {
            const key = draftKey(draftId)
            const ownershipKey = ownershipIndexKey(owner)

            /**
             * Both of these are independent, glide multiplexes them over the same connection, so they
             * cost a single round trip instead of two sequential ones.
             */
            const [exists, isMember] = await Promise.all([valkey.exists([key]), valkey.sismember(ownershipKey, key)])

            // Does document even exist?
            if (exists !== 1) return

            // If the ownership is not in the index, it's not this users draft
            if (!isMember) {
                throw new Error(`Draft with ID ${draftId} does not belong to ownership ${owner.hpr} or provided ident`)
            }

            await Promise.all([valkey.del([key]), valkey.srem(ownershipKey, [key])])
        }),
        getDraft: withSpanServerAsync(
            'draft client - get draft',
            async (draftId, owner): Promise<DraftEntry | null> => {
                const key = draftKey(draftId)
                const ownershipKey = ownershipIndexKey(owner)

                /**
                 * Both of these are independent, glide multiplexes them over the same connection, so they
                 * cost a single round trip. A missing key yields an empty hash, so no EXISTS is needed.
                 */
                const [isMember, value] = await Promise.all([
                    valkey.sismember(ownershipKey, key),
                    valkey.hgetall(key).then(hashToRecord),
                ])

                if (Object.keys(value).length === 0) return null

                // If the ownership is not in the index, it's not this users draft
                if (!isMember) {
                    throw new Error(
                        `Draft with ID ${draftId} does not belong to ownership ${owner.hpr} or provided ident`,
                    )
                }

                return internalEntryToDraftEntry(value)
            },
        ),
        getDrafts: withSpanServerAsync('draft client - get all drafts', async (ownership) => {
            const ownershipKey = ownershipIndexKey(ownership)
            const keys = [...(await valkey.smembers(ownershipKey))].map(String)
            if (keys.length === 0) {
                return []
            }

            const entries = await Promise.all(
                keys.map(async (key) => [key, hashToRecord(await valkey.hgetall(key))] as const),
            )

            /**
             * Drafts expire on their own, but the ownership index does not shrink with them, which would make
             * this set (and this N+1 lookup) grow forever. Prune the dangling members as we find them.
             */
            const staleKeys = entries.filter(([, value]) => Object.keys(value).length === 0).map(([key]) => key)
            if (staleKeys.length > 0) {
                await valkey.srem(ownershipKey, staleKeys)
            }

            return (
                entries
                    .map(([, value]) => value)
                    .filter((value) => Object.keys(value).length > 0)
                    .map(internalEntryToDraftEntry)
                    // Removes potentially broken drafts
                    .filter(R.isNonNull)
            )
        }),
    }
}

function internalEntryToDraftEntry(value: Record<string, string>): DraftEntry | null {
    if (!value.draftId || !value.lastUpdated || !value.deletesAt || !value.values) {
        logger.warn(
            `Found incomplete draft object, draftId: ${!!value.draftId}, lastUpdated: ${!!value.lastUpdated}, values: ${!!value.values}`,
        )
        return null
    }

    return {
        draftId: value.draftId,
        lastUpdated: value.lastUpdated,
        deletesAt: value.deletesAt,
        values: JSON.parse(value.values),
    } satisfies DraftEntry
}

function secondsToMidnightTomorrow(): number {
    const now = new Date()
    const tomorrow = addDays(now, 1)

    return differenceInSeconds(endOfDay(tomorrow), new Date())
}

function draftKey(draftId: string): `draft:${string}` {
    return draftId.startsWith('draft:') ? (draftId as `draft:${string}`) : `draft:${draftId}`
}

function ownershipIndexKey({ hpr, ident }: DraftOwnership): `ownership:hpr:${string}:ident:${string}` {
    return `ownership:hpr:${hpr}:ident:${ident}`
}
