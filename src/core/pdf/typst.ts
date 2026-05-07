import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

import { logger } from '@navikt/next-logger'

import { PdfResult, TypstPdfSykmelding } from '@core/pdf/types'
import { failSpan, spanServerAsync } from '@lib/otel/server'

const execFileAsync = promisify(execFile)

type Modules = {
    module: 'sykmelding.typ'
    payload: TypstPdfSykmelding
}

export function execTypst(module: Modules): Promise<PdfResult> {
    return spanServerAsync('typst.execTypst', async (span) => {
        span.setAttributes({
            'typst.module': module.module,
        })
        try {
            const start = performance.now()
            const { stdout } = await execFileAsync(
                './typst-pdf/typst',
                [
                    'compile',
                    '--pdf-standard=a-2a',
                    '--font-path=./typst-pdf/fonts',
                    `--input=sykmelding=${JSON.stringify(module.payload)}`,
                    'typst-pdf/sykmelding.typ',
                    '-',
                ],
                { encoding: 'buffer' },
            )

            logger.info(
                `PDF created - typst module ${module.module} (${stdout.buffer.byteLength} bytes), it took ${(performance.now() - start).toFixed(2)}ms`,
            )

            return { ok: true, pdf: stdout.buffer }
        } catch (error: unknown) {
            // Is it ENOENT? In which case, the binary is missing
            if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
                return { ok: false, error: 'Typst binary not found. Ensure it is available in ./typst-pdf/typst' }
            }

            /**
             * The command itself contains the actual sykmelding, if we want to log the error we need to manually
             * remove any potential sensitive data. :)
             */
            const errorMessage = ((error as Error)?.message ?? 'Unknown error').replace(
                /--input=sykmelding=.*?(?= typst-pdf\/sykmelding\.typ\b)/,
                '--input=sykmelding=<redacted>',
            )
            const cleanError = new Error(errorMessage)

            failSpan(span, 'PDF generation with typst', cleanError)

            return { ok: false, error: 'typst-cli invocation failed' }
        }
    })
}
