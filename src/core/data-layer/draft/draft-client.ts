import * as R from 'remeda'
import { addDays, differenceInSeconds, endOfDay } from 'date-fns'
import { logger } from '@navikt/next-logger'
import Valkey from 'iovalkey'

import { productionValkey } from '@core/services/valkey/client'
import { withSpanServerAsync } from '@lib/otel/server'
import { mockEngineForSession, shouldUseMockEngine } from '@dev/mock-engine'
import { getServerEnv } from '@lib/env'

import { DraftValues } from './draft-schema'

export type DraftOwnership = { hpr: string; ident: string }

type DraftEntryCore = {
    draftId: string
    // ISO 8601 date string
    lastUpdated: string
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

    return createDraftClient(productionValkey())
}

export function createDraftClient(valkey: Valkey): DraftClient {
    return {
        saveDraft: withSpanServerAsync(
            'draft client - save draft',
            async (draftId, owner, values, lastUpdated: Date = new Date()) => {
                const key = draftKey(draftId)
                const ownershipKey = ownershipIndexKey(owner)

                await valkey.hset(key, {
                    draftId,
                    values: JSON.stringify(values),
                    lastUpdated: lastUpdated.toISOString(),
                } satisfies ValkeyDraftEntry)
                await valkey.sadd(ownershipKey, key)

                await valkey.expire(key, secondsToMidnightTomorro())
                await valkey.expire(ownershipKey, secondsToMidnightTomorro())

                return values
            },
        ),
        deleteDraft: withSpanServerAsync('draft client - delete draft', async (draftId, owner) => {
            const key = draftKey(draftId)
            const ownershipKey = ownershipIndexKey(owner)

            // Does document even exist?
            const exists = await valkey.exists(key)
            if (exists !== 1) return

            // If the ownership is not in the index, it's not this users draft
            const isMember = await valkey.sismember(ownershipKey, key)
            if (isMember !== 1) {
                throw new Error(`Draft with ID ${draftId} does not belong to ownership ${owner.hpr} or provided ident`)
            }

            await valkey.del(key)
            await valkey.srem(ownershipKey, key)
        }),
        getDraft: withSpanServerAsync(
            'draft client - get draft',
            async (draftId, owner): Promise<DraftEntry | null> => {
                const key = draftKey(draftId)
                const ownershipKey = ownershipIndexKey(owner)

                // Does document even exist?
                const exists = await valkey.exists(key)
                if (exists !== 1) return null

                // If the ownership is not in the index, it's not this users draft
                const isMember = await valkey.sismember(ownershipKey, key)
                if (isMember !== 1) {
                    throw new Error(
                        `Draft with ID ${draftId} does not belong to ownership ${owner.hpr} or provided ident`,
                    )
                }

                const value = await valkey.hgetall(draftKey(draftId))
                if (valkeyEmptyHashValueToNull(value) == null) {
                    return null
                }

                return internalEntryToDraftEntry(value)
            },
        ),
        getDrafts: withSpanServerAsync('draft client - get all drafts', async (ownership) => {
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
        }),
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

function secondsToMidnightTomorro(): number {
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
