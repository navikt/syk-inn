import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

import { logger } from '@navikt/next-logger'

import type { SykInnApiSykmelding } from '@core/services/syk-inn-api/schema/sykmelding'
import { failSpan, spanServerAsync } from '@lib/otel/server'

const execFileAsync = promisify(execFile)

type TypstPdfResult = { ok: true; pdf: ArrayBuffer } | { ok: false; error: string }

export async function createTypstSykmelding(sykmelding: SykInnApiSykmelding): Promise<TypstPdfResult> {
    return spanServerAsync('typst-service.createTypstSykmelding', async (span) => {
        try {
            const start = performance.now()
            const { stdout } = await execFileAsync(
                './typst-pdf/typst',
                [
                    'compile',
                    '--pdf-standard=a-2a',
                    '--font-path=./typst-pdf/fonts',
                    `--input=sykmelding=${JSON.stringify(sykmelding)}`,
                    'typst-pdf/sykmelding.typ',
                    '-',
                ],
                { encoding: 'buffer' },
            )

            logger.info(
                `Seems like PDF generation was OK, ${stdout.buffer.byteLength}, it took ${(performance.now() - start).toFixed(2)}ms`,
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
