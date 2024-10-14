import React, { ReactElement } from 'react'
import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { Alert, BodyShort, Button, Checkbox, CheckboxGroup, Skeleton } from '@navikt/ds-react'

import { useNySykmeldingDataService } from '@components/ny-sykmelding/data-provider/NySykmeldingFormDataProvider'
import {
    ArbeidsgiverInfo,
    assertResourceAvailable,
} from '@components/ny-sykmelding/data-provider/NySykmeldingFormDataService'

import { useController } from '../NySykmeldingFormValues'

import ArbeidsgiverField from './ArbeidsgiverField'

function ArbeidsgiverWithDataField(): ReactElement {
    const dataService = useNySykmeldingDataService()
    const arbeidstakerQuery = useQuery({
        queryKey: ['arbeidstaker'],
        queryFn: () => {
            assertResourceAvailable(dataService.context.arbeidsgivere)

            return dataService.context.arbeidsgivere()
        },
    })

    if (arbeidstakerQuery.isError) {
        return (
            <ArbeidsgiverField>
                <PasientInfoDegredationInfo query={arbeidstakerQuery} />
            </ArbeidsgiverField>
        )
    }

    if (arbeidstakerQuery.data && arbeidstakerQuery.data.length === 0) {
        return (
            <ArbeidsgiverField>
                <Alert variant="info" className="mb-4">
                    Vi fant ingen arbeidsforhold for pasienten. Du kan fortsette utfyllingen ved å manuelt taste inn
                    arbeidsforholdet.
                </Alert>
            </ArbeidsgiverField>
        )
    }

    return (
        <div>
            {arbeidstakerQuery.isLoading && (
                <div>
                    <Skeleton variant="rectangle" height={132 + 20} className="mb-3" />
                    <Skeleton variant="rectangle" height={42} width="25%" className="mb-3" />
                    <Skeleton variant="rectangle" height={42} width="30%" className="mb-3" />
                </div>
            )}
            {arbeidstakerQuery.data && <ArbeidssituasjonCheckboxField arbeidsgivere={arbeidstakerQuery.data} />}
        </div>
    )
}

function ArbeidssituasjonCheckboxField({ arbeidsgivere }: { arbeidsgivere: ArbeidsgiverInfo[] }): ReactElement {
    const arbeidsgiverField = useController({
        name: 'context.arbeidsgiverOrgnummer',
    })

    return (
        <>
            <CheckboxGroup
                legend="Arbeidssituasjon sykmeldingen gjelder for"
                size="small"
                {...arbeidsgiverField.field}
                value={arbeidsgiverField.field.value ?? []}
                description={
                    <>
                        <BodyShort spacing>
                            Dersom du velger flere arbeidsgivere, blir det opprettet flere sykmeldinger, så bruker kan
                            sende inn hver sykmeldign til hver arbeidsgiver.
                        </BodyShort>
                        <BodyShort>
                            Dersom diagnoser eller perioder er forskjellige mellom arbeidsforholdene, må det opprettes
                            flere sykmeldinger.
                        </BodyShort>
                    </>
                }
            >
                {arbeidsgivere.map((it) => (
                    <Checkbox
                        key={it.organisasjonsnummer}
                        value={it.organisasjonsnummer}
                        description={it.organisasjonsnummer}
                    >
                        {it.navn}
                    </Checkbox>
                ))}
            </CheckboxGroup>
            {arbeidsgiverField.field.value && arbeidsgiverField.field.value.length > 1 && (
                <Alert variant="info" className="mt-2">
                    Det vil bli opprettet {arbeidsgiverField.field.value.length} sykmeldinger med samme periode og
                    diagnose.
                </Alert>
            )}
        </>
    )
}

function PasientInfoDegredationInfo({ query }: { query: UseQueryResult }): ReactElement {
    return (
        <Alert variant="warning" className="mb-4">
            <BodyShort spacing>
                Vi kunne ikke laste arbeidsforhold til pasienten. Du kan enten{' '}
                <Button
                    size="xsmall"
                    variant="secondary-neutral"
                    onClick={() => query.refetch()}
                    loading={query.isRefetching}
                >
                    prøve på nytt
                </Button>
                , eller prøve igjen senere.
            </BodyShort>
            <BodyShort>Du kan fortsette utfyllingen ved å manuelt taste inn arbeidsforholdet.</BodyShort>
        </Alert>
    )
}

export default ArbeidsgiverWithDataField
