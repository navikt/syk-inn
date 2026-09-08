import { exportJWK, generateKeyPair } from 'jose'

const alg = 'RS256'

const { privateKey, publicKey } = await generateKeyPair(alg, { extractable: true })

// private -> stdout, so it can be piped into wl-copy/pbcopy without hitting the scrollback
process.stdout.write(JSON.stringify({ ...(await exportJWK(privateKey)), alg, use: 'sig' }))

// public -> stderr, so it stays visible when stdout is piped
process.stderr.write(JSON.stringify({ ...(await exportJWK(publicKey)), alg, use: 'sig' }) + '\n')
