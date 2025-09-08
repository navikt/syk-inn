import { configureLogger } from '@navikt/next-logger'

configureLogger({
    basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? undefined,
})
