import { z } from 'zod'

export type WellKnown = z.infer<typeof WellKnownSchema>
export const WellKnownSchema = z.object({
    issuer: z.string(),
    jwks_uri: z.string(),
    authorization_endpoint: z.string(),
    token_endpoint: z.string(),
})

export const TokenResponse = z.infer<typeof TokenResponseSchema>
export const TokenResponseSchema = z.object({
    // OIDC:
    access_token: z.string(),
    id_token: z.string(),
    // SMART:
    patient: z.string(),
    encounter: z.string(),
})

/*
export const TokenResponseExample = {
    access_token:
        'eyJhbGciOiJSUzI1NiIsImtpZCI6InZlcnktY29vbC1raWQifQ.eyJ5byI6InN1cCIsImlhdCI6MTczODkyMjQ0NywiaXNzIjoiaHR0cHM6Ly9zeWstaW5uLmVrc3Rlcm4uZGV2Lm5hdi5uby9zYW1hcmJlaWRzcGFydG5lci9zeWttZWxkaW5nL2FwaS9tb2Nrcy9maGlyIiwiYXVkIjoiaHR0cHM6Ly9zeWstaW5uLmVrc3Rlcm4uZGV2Lm5hdi5uby9zYW1hcmJlaWRzcGFydG5lci9zeWttZWxkaW5nL2FwaS9tb2Nrcy9maGlyIn0.PWm8pJI6SmwCSNXDzAToLp9Hu6Ci-lgGnC54KoqNQP8522AAhS59zQGoqCngsVuUuWxrHLdCHqPSFW_qA_XTCqx2Q1vWjBVLSyFDQPIoWuU6rBna_RtzjvC9yhuOAME19QFt53lIB9c_6-kcNi4YrNuXZDDqUoRUZ2zol--dNE39NZgq_tZKttO-D0wsMEPSrMQscrqm7tpTSGKKW7bQRZbVA2XJ3V6L2Q4_ncxMsvYmch4nS0aSNpyxs9W3JiYJ47QduPEleRS_a-9n5GIt8n0TfnaqOyRJba1P5FbskzyttaEwRhK7ZCrWcrriXZzFuelPoG1xMI8L6lO9U1mWbQ',
    id_token:
        'eyJhbGciOiJSUzI1NiIsImtpZCI6InZlcnktY29vbC1raWQifQ.eyJwcm9maWxlIjoiUHJhY3RpdGlvbmVyL2ExZjFlZDYyLTA2NmEtNDA1MC05MGY3LTgxZThmNjJlYjNjMiIsImZoaXJVc2VyIjoiUHJhY3RpdGlvbmVyL2ExZjFlZDYyLTA2NmEtNDA1MC05MGY3LTgxZThmNjJlYjNjMiIsImlhdCI6MTczODkyMjQ0NywiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDozMDAwL2FwaS9tb2Nrcy9maGlyIiwiYXVkIjoic3lrLWlubiIsImV4cCI6MTczODkyOTY0N30.Yf7dbFyOwLGtWXv0aRYi2zWJprPmqFrfb94Gko8NOjsDMI8S9VL4KNOrcWvq7p-7LEuyFdZjc90_N2v5doP8MsgL5C7XCQcnkgM5NJvDfpytL9WXrvaRXiQLSegUi9vRPmQ1CPv6K1ikLMEJ0q9J6pw35Y4fFYdMxmnEAaeuaSJj-r-pSJuQoDe6EkHIt5U_H1SoEULXPqnqX8gbtuaWBD1mceM1rmVzWimh6YKkzHniG2yAo0NKo_aKL-K1288rKw-PwyjQQQ0OGiIsHw8yQGIWyBh_tJ7tJo7i_rOTT1N5tGPclCir5_305Swc0Y0spXC5e8B19dHEKVZParUkNg',
    token_type: 'Bearer',
    expires_in: 3600,
    scope: 'openid profile launch fhirUser patient/*.* user/*.* offline_access',
    need_patient_banner: true,
    smart_style_url: 'https://syk-inn.ekstern.dev.nav.no/samarbeidspartner/sykmelding/api/fhir/smart-style.json',
    patient: 'cd09f5d4-55f7-4a24-a25d-a5b65c7a8805',
    encounter: '320fd29a-31b9-4c9f-963c-c6c88332d89a',
}
 */

/*
export const WedMedExampleResponse = {
    issuer: 'https://security.public.webmedepj.no',
    jwks_uri: 'https://security.public.webmedepj.no/.well-known/openid-configuration/jwks',
    authorization_endpoint: 'https://security.public.webmedepj.no/connect/authorize',
    token_endpoint: 'https://security.public.webmedepj.no/connect/token',
    token_endpoint_auth_methods_supported: ['client_secret_basic', 'client_secret_post', 'private_key_jwt'],
    grant_types_supported: [
        'authorization_code',
        'client_credentials',
        'refresh_token',
        'implicit',
        'password',
        'urn:ietf:params:oauth:grant-type:device_code',
        'delegation',
    ],
    introspection_endpoint: 'https://security.public.webmedepj.no/connect/introspect',
    revocation_endpoint: 'https://security.public.webmedepj.no/connect/revocation',
    code_challenge_methods_supported: ['plain', 'S256'],
    capabilities: [
        'permission-v1',
        'launch-ehr',
        'client-confidential-asymmetric',
        'context-ehr-patient',
        'permission-user',
        'permission-patient',
    ],
}
*/
