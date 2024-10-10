import React, { ReactElement } from 'react'
import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { Alert, BodyShort, Button, Checkbox, CheckboxGroup } from '@navikt/ds-react'

import { useNySykmeldingDataService } from '@components/ny-sykmelding/data-provider/NySykmeldingFormDataProvider'
import {
    ArbeidsgiverInfo,
    assertResourceAvailable,
} from '@components/ny-sykmelding/data-provider/NySykmeldingFormDataService'
import ArbeidstakerField from '@components/ny-sykmelding/arbeidssituasjon/ArbeidstakerField'
import { useController } from '@components/ny-sykmelding/NySykmeldingFormValues'

function ArbeidstakerWithDataField(): ReactElement {
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
            <ArbeidstakerField>
                <PasientInfoDegredationInfo query={arbeidstakerQuery} />
            </ArbeidstakerField>
        )
    }

    if (arbeidstakerQuery.data && arbeidstakerQuery.data.length === 0) {
        return (
            <ArbeidstakerField>
                <Alert variant="info" className="mb-4">
                    Vi fant ingen arbeidsforhold for pasienten. Du kan fortsette utfyllingen ved å manuelt taste inn
                    arbeidsforholdet.
                </Alert>
            </ArbeidstakerField>
        )
    }

    return (
        <div>
            {arbeidstakerQuery.isLoading && <div>Loading...</div>}
            {arbeidstakerQuery.data && <ArbeidssituasjonCheckboxField arbeidsgivere={arbeidstakerQuery.data} />}
        </div>
    )
}

function ArbeidssituasjonCheckboxField({ arbeidsgivere }: { arbeidsgivere: ArbeidsgiverInfo[] }): ReactElement {
    const arbeidsgiverField = useController({
        name: 'context.arbeidsgiverOrgnummer',
    })

    return (
        <CheckboxGroup
            legend="Arbeidssituasjon sykmeldingen gjelder for"
            size="small"
            {...arbeidsgiverField.field}
            value={arbeidsgiverField.field.value ?? []}
            description={
                <>
                    <BodyShort spacing>
                        Dersom du velger flere arbeidsgivere, blir det opprettet flere sykmeldinger, så bruker kan sende
                        inn hver sykmeldign til hver arbeidsgiver.
                    </BodyShort>
                    <BodyShort>
                        Dersom diagnoser eller perioder er forskjellige mellom arbeidsforholdene, må det opprettes flere
                        sykmeldinger.
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

export default ArbeidstakerWithDataField
