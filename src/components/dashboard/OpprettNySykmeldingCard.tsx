import React, { CSSProperties, ReactElement, useState } from 'react'
import { Alert, BodyShort, Button, ConfirmationPanel, Detail, Heading, Skeleton } from '@navikt/ds-react'
import { useQuery } from '@apollo/client'

import AssableNextLink from '@components/misc/AssableNextLink'
import { PasientDocument } from '@queries'

function OpprettNySykmeldingCard(): ReactElement {
    const { data, loading, error, refetch } = useQuery(PasientDocument)
    const [hasLegged, setHasLegged] = useState(true)

    return (
        <section className="bg-bg-default rounded p-4" aria-labelledby="opprett-sykmelding-heading">
            <Heading size="medium" level="2" spacing id="opprett-sykmelding-heading">
                Opprett ny sykmelding
            </Heading>
            <Heading size="small" level="3">
                Pasientopplysninger
            </Heading>
            <Detail>Denne sykmeldingen opprettes for følgende person</Detail>
            {loading && (
                <div className="flex gap-6 mt-3 mb-2">
                    <div className="min-w-32">
                        <Skeleton width={120} />
                        <Skeleton width={120} />
                    </div>
                    <div>
                        <Skeleton width={120} />
                        <Skeleton width={120} />
                    </div>
                </div>
            )}
            {error && (
                <Alert variant="error">
                    <BodyShort>Kunne ikke hente pasientopplysninger</BodyShort>
                    <Button size="xsmall" onClick={() => refetch()}>
                        Prøv på nytt
                    </Button>
                </Alert>
            )}
            {!loading && data?.pasient && (
                <div className="flex gap-6 mt-3">
                    <div className="min-w-32">
                        <Detail>Navn</Detail>
                        <BodyShort spacing>{data.pasient.navn ?? 'what'}</BodyShort>
                    </div>
                    <div>
                        <Detail>ID-nummer</Detail>
                        <BodyShort spacing>{data.pasient.ident}</BodyShort>
                    </div>
                </div>
            )}

            <div>
                <Heading size="small" level="3">
                    Bekreftelse
                </Heading>
                <div className="flex flex-row gap-3">
                    <div
                        className="grow"
                        style={
                            {
                                '--ac-confirmation-panel-checked-bg': 'transparent',
                                '--ac-confirmation-panel-checked-border': 'transparent',
                            } as CSSProperties
                        }
                    >
                        <ConfirmationPanel
                            checked={hasLegged}
                            label="Pasienten er kjent eller har vist legitimasjon"
                            onChange={() => setHasLegged((x) => !x)}
                            size="small"
                        />
                    </div>

                    <div className="flex items-center justify-end">
                        <Button
                            as={AssableNextLink}
                            variant="primary"
                            href="/fhir/ny"
                            disabled={loading || !hasLegged}
                            loading={loading}
                            size="small"
                        >
                            Opprett sykmelding
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default OpprettNySykmeldingCard
