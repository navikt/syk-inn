import { NextResponse } from 'next/server'
import { logger } from '@navikt/next-logger'

import { bundledEnv, getServerEnv } from '@lib/env'
import { getDevFhirConfiguration } from '@data-layer/fhir/smart/issuers/envs/dev-gcp'
import { getProdFhirConfiguration } from '@data-layer/fhir/smart/issuers/envs/prod-gcp'

export async function GET(): Promise<NextResponse> {
    try {
        getServerEnv()
        if (bundledEnv.runtimeEnv === 'dev-gcp') getDevFhirConfiguration()
        if (bundledEnv.runtimeEnv === 'prod-gcp') getProdFhirConfiguration()
    } catch (e) {
        logger.error(e)
        return NextResponse.json({ message: 'I am not ready :(' }, { status: 500 })
    }

    return NextResponse.json({ message: 'I am ready :)' })
}
