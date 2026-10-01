// oxlint-disable-next-line typescript/explicit-function-return-type
export const createWellKnown = (baseUrl: string) => ({
    issuer: baseUrl,
    userinfo_endpoint: `${baseUrl}/connect/userinfo`,
    jwks_uri: `${baseUrl}/keys`,
})
