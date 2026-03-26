import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

import type { SykInnApiSykmelding } from '@core/services/syk-inn-api/schema/sykmelding'

const execFileAsync = promisify(execFile)

type TypstPdfResult = { ok: true; pdf: ArrayBuffer } | { ok: false; error: string }

export async function createTypstSykmelding(data: SykInnApiSykmelding): Promise<TypstPdfResult> {
    try {
        const { stdout } = await execFileAsync(
            'typst',
            [
                'compile',
                '--pdf-standard=a-2a',
                '--font-path=./typst-pdf/fonts',
                `--input=data=${JSON.stringify(data)}`,
                'typst-pdf/sykmelding.typ',
                '-',
            ],
            { encoding: 'buffer' },
        )

        return { ok: true, pdf: stdout.buffer }
    } catch (e) {
        const err = e as { stderr?: Buffer; message?: string }
        return { ok: false, error: err.stderr?.toString() ?? err.message ?? 'Unknown error' }
    }
}
