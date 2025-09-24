import React, { ReactElement } from 'react'
import { Alert, BodyShort, FormSummary, Label, Skeleton } from '@navikt/ds-react'
import { useQuery } from '@apollo/client/react'

import { BehandlerDocument } from '@queries'
import { SpecificErrorAlert } from '@components/help/GeneralErrors'

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
                        <SpecificErrorAlert title="Kunne ikke hente signerende behandler." retry={() => refetch()}>
                            Dette hindrer deg i å sende inn sykmeldingen. Du kan lagre utkastet og prøve å sende inn
                            sykmeldingen senere.
                        </SpecificErrorAlert>
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
                <Label as="p" size="small">
                    Er opplysningene om behandler feil?
                </Label>
                <BodyShort spacing size="small">
                    Logg ut av EPJ og inn med din egen profil hvis navnet på behandler ikke stemmer. Manglende eller
                    feil HPR-nummer må rettes i EPJ før innsending.
                </BodyShort>
            </Alert>
        </div>
    )
}

function FormValueSkeleton(): ReactElement {
    return (
        <FormSummary.Value>
            <Skeleton width={120} />
        </FormSummary.Value>
    )
}

export default BehandlerSummary
