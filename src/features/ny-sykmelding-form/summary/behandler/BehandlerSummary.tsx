import React, { ReactElement } from 'react'
import { FormSummary, InfoCard, Skeleton } from '@navikt/ds-react'
import { useQuery } from '@apollo/client/react'
import { InformationSquareIcon } from '@navikt/aksel-icons'

import { BehandlerDocument } from '@queries'
import { SimpleAlert } from '@components/help/GeneralErrors'
import BehandlerOrganisasjonsnummerAnswer from '@features/ny-sykmelding-form/summary/behandler/BehandlerOrganisasjonsnummerAnswer'
import BehandlerTelefonnummerAnswer from '@features/ny-sykmelding-form/summary/behandler/BehandlerTelefonnummerAnswer'

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
                        <SimpleAlert
                            level="error"
                            title="Kunne ikke hente signerende behandler."
                            retry={() => refetch()}
                        >
                            Dette hindrer deg i å sende inn sykmeldingen. Du kan lagre utkastet og prøve å sende inn
                            sykmeldingen senere.
                        </SimpleAlert>
                    </div>
                </FormSummary>
            </div>
        )
    }

    return (
        <section className={className} aria-labelledby="signerende-behandler-heading">
            <FormSummary>
                <FormSummary.Header>
                    <FormSummary.Heading id="signerende-behandler-heading" level="2">
                        Signerende behandler
                    </FormSummary.Heading>
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
                    {loading ? (
                        <AnswerSkeleton label="Organisasjonsnummer" />
                    ) : (
                        <BehandlerOrganisasjonsnummerAnswer contextOrganisasjonsnummer={data?.behandler?.orgnummer} />
                    )}
                    {loading ? (
                        <AnswerSkeleton label="Telefonnummer legekontor" />
                    ) : (
                        <BehandlerTelefonnummerAnswer contextTelefonnummer={data?.behandler?.legekontorTlf} />
                    )}
                </FormSummary.Answers>
            </FormSummary>
            <InfoCard data-color="info" className="mt-4" size="small">
                <InfoCard.Header icon={<InformationSquareIcon aria-hidden />}>
                    <InfoCard.Title>Er opplysningene om behandler feil?</InfoCard.Title>
                </InfoCard.Header>
                <InfoCard.Content>
                    Logg ut av EPJ og inn med din egen profil hvis navnet på behandler ikke stemmer. Manglende eller
                    feil HPR-nummer må rettes i EPJ før innsending.
                </InfoCard.Content>
            </InfoCard>
        </section>
    )
}

function AnswerSkeleton({ label }: { label: string }): ReactElement {
    return (
        <FormSummary.Answer>
            <FormSummary.Label>{label}</FormSummary.Label>
            <FormValueSkeleton />
        </FormSummary.Answer>
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
