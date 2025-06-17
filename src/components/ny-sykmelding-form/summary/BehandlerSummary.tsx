import React, { ReactElement } from 'react'
import { Alert, BodyShort, Button, FormSummary, Heading, Skeleton } from '@navikt/ds-react'
import { useQuery } from '@apollo/client'

import { BehandlerDocument } from '@queries'

type Props = {
    className?: string
}

function BehandlerSummary({ className }: Props): ReactElement {
    const { loading, data, error, refetch } = useQuery(BehandlerDocument, {
        notifyOnNetworkStatusChange: true,
    })

    if (error) {
        return (
            <div className={className}>
                <FormSummary>
                    <FormSummary.Header>
                        <FormSummary.Heading level="2">Signerende behandler</FormSummary.Heading>
                    </FormSummary.Header>
                    <div className="p-6">
                        <Alert variant="error">
                            <Heading size="small" level="3">
                                Kunne ikke hente signerende behandler.
                            </Heading>
                            <BodyShort spacing>
                                Dette hindrer deg i å sende inn sykmeldingen. Du kan lagre utkastet og prøve å sende inn
                                sykmeldingen senere.
                            </BodyShort>
                            <BodyShort spacing>
                                Dersom problemet vedvarer, må du kontakte lege- og behandlertelefon.
                            </BodyShort>
                            <Button variant="secondary-neutral" size="small" onClick={() => refetch()}>
                                Prøv på nytt
                            </Button>
                        </Alert>
                    </div>
                </FormSummary>
            </div>
        )
    }

    return (
        <div className={className}>
            <FormSummary>
                <FormSummary.Header>
                    <FormSummary.Heading level="2">Signerende behandler</FormSummary.Heading>
                </FormSummary.Header>
                <FormSummary.Answers>
                    <FormSummary.Answer>
                        <FormSummary.Label>HPR</FormSummary.Label>
                        {loading ? (
                            <FormValueSkeleton />
                        ) : data?.behandler?.hpr ? (
                            <FormSummary.Value>{data.behandler.hpr}</FormSummary.Value>
                        ) : (
                            <FormSummary.Value className="italic">Mangler</FormSummary.Value>
                        )}
                    </FormSummary.Answer>
                    <FormSummary.Answer>
                        <FormSummary.Label>Navn</FormSummary.Label>
                        {loading ? (
                            <FormValueSkeleton />
                        ) : data?.behandler?.navn ? (
                            <FormSummary.Value>{data.behandler.navn}</FormSummary.Value>
                        ) : (
                            <FormSummary.Value className="italic">Mangler</FormSummary.Value>
                        )}
                    </FormSummary.Answer>
                    <FormSummary.Answer>
                        <FormSummary.Label>Organisasjonsnummer</FormSummary.Label>
                        {loading ? (
                            <FormValueSkeleton />
                        ) : data?.behandler?.orgnummer ? (
                            <FormSummary.Value>{data?.behandler.orgnummer}</FormSummary.Value>
                        ) : (
                            <FormSummary.Value className="italic">Mangler</FormSummary.Value>
                        )}
                    </FormSummary.Answer>
                    <FormSummary.Answer>
                        <FormSummary.Label>Kontaktinformasjon</FormSummary.Label>
                        {loading ? (
                            <FormValueSkeleton />
                        ) : data?.behandler?.legekontorTlf ? (
                            <>
                                <FormSummary.Value className="text-sm font-bold">
                                    Telefonnummer legekontor:
                                </FormSummary.Value>
                                <FormSummary.Value>{data?.behandler.legekontorTlf}</FormSummary.Value>
                            </>
                        ) : (
                            <FormSummary.Value className="italic">Mangler</FormSummary.Value>
                        )}
                    </FormSummary.Answer>
                </FormSummary.Answers>
            </FormSummary>
            <Alert variant="info" className="mt-4" size="small">
                <BodyShort spacing size="small">
                    Dersom signerende behandler ikke er korrekt, må du logge ut av EPJ-systemet og logge på med din egen
                    profil.
                </BodyShort>
                <BodyShort size="small">
                    Dersom HPR-nummeret mangler, eller ikke er ditt. Må du korrigere dette i EPJ-systemet.
                </BodyShort>
            </Alert>
        </div>
    )
}

export function FormValueSkeleton(): ReactElement {
    return (
        <FormSummary.Value>
            <Skeleton width={120} />
        </FormSummary.Value>
    )
}

export default BehandlerSummary
