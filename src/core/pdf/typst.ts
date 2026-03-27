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
        } catch (e) {
            failSpan.silently(span, 'PDF generation with typst', e as Error)

            // Is it ENOENT? In which case, the binary is missing
            if (e instanceof Error && 'code' in e && e.code === 'ENOENT') {
                return { ok: false, error: 'Typst binary not found. Ensure it is available in ./typst-pdf/typst' }
            }

            const err = e as { stderr?: Buffer; message?: string }
            return { ok: false, error: err.stderr?.toString() ?? err.message ?? 'Unknown error' }
        }
    })
}
