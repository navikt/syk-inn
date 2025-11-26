import { beforeAll, describe, it, expect } from 'vitest'
import { StartedTestContainer } from 'testcontainers'

import { getSykInnApiPath, initializeSykInnApi } from '@lib/test/syk-inn-api'

describe('SykInnApi integration', () => {
    let sykInnApi: StartedTestContainer

    beforeAll(async () => {
        sykInnApi = await initializeSykInnApi()
    }, 60_000)

    it('sanity check health endpoint', async () => {
        const healthResult = await fetch(getSykInnApiPath(sykInnApi, '/internal/health')).then((it) => it.json())

        expect(healthResult.status).toEqual('UP')
    })
})
