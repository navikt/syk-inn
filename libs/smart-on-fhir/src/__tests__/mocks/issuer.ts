import nock, { Scope } from 'nock'

import { FHIR_SERVER } from './common'

export function mockSmartConfiguration(): Scope {
    return nock(FHIR_SERVER)
        .get('/.well-known/smart-configuration')
        .reply(200, {
            issuer: FHIR_SERVER,
            jwks_uri: `${FHIR_SERVER}/jwks`,
            authorization_endpoint: `${FHIR_SERVER}/authorize`,
            token_endpoint: `${FHIR_SERVER}/token`,
        })
}
