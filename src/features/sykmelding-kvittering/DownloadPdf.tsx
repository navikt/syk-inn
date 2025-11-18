import { Button, ErrorMessage } from '@navikt/ds-react'
import React, { ReactElement, useState } from 'react'
import { FilePdfIcon } from '@navikt/aksel-icons'
import { logger } from '@navikt/next-logger'
import { AnimatePresence } from 'motion/react'

import { useMode } from '@core/providers/Modes'
import { pathWithBasePath } from '@lib/url'
import { SimpleReveal } from '@components/animation/Reveal'
import { spanBrowserAsync } from '@lib/otel/browser'

type Props = {
    sykmeldingId: string
}

export function DownloadPdfButton({ sykmeldingId }: Props): ReactElement {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { paths } = useMode()

    return (
        <>
            <Button
                size="small"
                className="h-[62px] w-full"
                icon={<FilePdfIcon fontSize="2rem" aria-hidden />}
                variant="secondary-neutral"
                loading={loading}
                onClick={async () => {
                    setError(null)
                    setLoading(true)

                    try {
                        const result = await downloadPdf(
                            pathWithBasePath(paths.pdf(sykmeldingId)),
                            `sykmelding-${sykmeldingId}.pdf`,
                        )
                        if (result !== 'ok') {
                            setError(result.error)
                        }
                    } catch (e) {
                        logger.error(new Error('Feil ved nedlasting av sykmelding som PDF', { cause: e }))
                        setError('Ukjent feil ved nedlasting av PDF')
                    } finally {
                        setLoading(false)
                    }
                }}
            >
                Last ned sykmeldingen som PDF
            </Button>
            <AnimatePresence initial={false}>
                {error && (
                    <SimpleReveal>
                        <ErrorMessage className="mt-2 ml-2">{error}</ErrorMessage>
                    </SimpleReveal>
                )}
            </AnimatePresence>
        </>
    )
}

async function downloadPdf(url: string, fileName: string): Promise<'ok' | { error: string }> {
    return spanBrowserAsync('DownloadPdfButton.download', async () => {
        const res = await fetch(url)

        if (!res.ok) return { error: `Kunne ikke laste ned sykmelding som PDF: ${res.status}` }

        const blob = await res.blob()
        const objectUrl = URL.createObjectURL(blob)

        const a = document.createElement('a')
        a.href = objectUrl
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        a.remove()

        URL.revokeObjectURL(objectUrl)

        return 'ok'
    })
}
