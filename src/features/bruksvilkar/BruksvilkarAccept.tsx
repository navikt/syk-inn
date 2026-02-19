import { ReactElement, useState } from 'react'
import { Button, Checkbox } from '@navikt/ds-react'
import { logger } from '@navikt/next-logger'
import { AnimatePresence } from 'motion/react'

import { createFhirPaths } from '@core/providers/ModePaths'
import { pathWithBasePath } from '@lib/url'
import { BRUKSVILKAR_VERSION } from '@features/bruksvilkar/BruksvilkarSection'
import { SimpleReveal } from '@components/animation/Reveal'
import { SimpleAlert } from '@components/help/GeneralErrors'

type Props = {
    patientId: string
    onAcceptOk: (accept: { version: string; at: string }) => void
}

export function AcceptBruksvilkar({ patientId, onAcceptOk }: Props): ReactElement {
    const paths = createFhirPaths(patientId)
    const [toggledAccept, setToggledAccept] = useState(false)
    const [accepting, setAccepting] = useState(false)
    const [acceptError, setAcceptError] = useState<string | null>(null)

    return (
        <>
            <div className="flex gap-3 items-center">
                <Checkbox
                    className="flex items-center"
                    data-color="accent"
                    value={toggledAccept}
                    onChange={() => setToggledAccept((b) => !b)}
                >
                    Jeg bekrefter at jeg godtar disse bruksvilkårene, og ønsker å være en pilotbruker.
                </Checkbox>
                <Button
                    className="shrink-0 h-fit"
                    disabled={!toggledAccept}
                    loading={accepting}
                    onClick={async () => {
                        setAcceptError(null)
                        setAccepting(true)

                        try {
                            const response = await fetch(pathWithBasePath(paths.bruksvilkar.accept), {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    patientId,
                                    version: BRUKSVILKAR_VERSION,
                                }),
                            })

                            const result = await response.json()
                            onAcceptOk({ at: result.acceptedAt, version: result.version })
                        } catch (e) {
                            logger.error(e)
                            setAcceptError('Noe gikk galt ved innsending av aksept, prøv igjen senere!')
                        } finally {
                            setAccepting(false)
                        }
                    }}
                >
                    Send inn
                </Button>
            </div>
            <AnimatePresence>
                {acceptError && (
                    <SimpleReveal>
                        <SimpleAlert
                            title="Feil ved godkjenning av bruksvilkår"
                            noSessionId
                            level="error"
                            className="mb-2"
                        >
                            Vi klarte ikke å lagre din godkjenning av bruksvilkårene akkurat nå. Prøv igjen senere.
                        </SimpleAlert>
                    </SimpleReveal>
                )}
            </AnimatePresence>
        </>
    )
}
