export async function register(): Promise<void> {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        /**
         * This forces next.js's module tracing output (standalone) to include these libraries, because they are
         * otherwise never seen by the module tracer.
         */
        await require('pino')
        await require('pino-roll')
        await require('next-logger')
    }
}
