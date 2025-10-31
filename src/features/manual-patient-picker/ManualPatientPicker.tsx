'use client'

import React, { ReactElement } from 'react'
import { Alert, BodyShort, Heading, LinkCard, Skeleton } from '@navikt/ds-react'
import { useLazyQuery } from '@apollo/client/react'
import Link from 'next/link'

import { PersonByIdentDocument } from '@queries'
import { useAppDispatch, useAppSelector } from '@core/redux/hooks'
import { nySykmeldingActions } from '@core/redux/reducers/ny-sykmelding'
import ManualPatientSearch from '@features/manual-patient-picker/ManualPatientSearch'

function ManualPatientPicker(): ReactElement {
    const dispatch = useAppDispatch()
    const existingPatient = useAppSelector((state) => state.nySykmelding.pasient)
    const [searchPerson, { loading, data, error }] = useLazyQuery(PersonByIdentDocument, {
        fetchPolicy: 'network-only',
    })
    const handleSearch = async (ident: string): Promise<void> => {
        if (!ident) return

        const pdlPerson = await searchPerson({
            variables: { ident: ident },
        })

        if (pdlPerson.data?.person) {
            dispatch(
                nySykmeldingActions.manualPatient({
                    type: 'manual',
                    ident: pdlPerson.data.person.ident,
                    navn: pdlPerson.data.person.navn,
                }),
            )
        }
    }

    return (
        <div className="p-4 w-[65ch]">
            <ManualPatientSearch handleSearch={handleSearch} defaultIdent={existingPatient?.ident} />
            {loading && (
                <div className="mt-4">
                    <Skeleton height={94} variant="rounded" />
                </div>
            )}
            {!loading && data?.person != null && (
                <LinkCard className="mt-4">
                    <LinkCard.Title>
                        <LinkCard.Anchor asChild>
                            <Link href="/ny">Opprett sykmelding for {data.person.navn}</Link>
                        </LinkCard.Anchor>
                        <LinkCard.Description>{data.person.ident}</LinkCard.Description>
                    </LinkCard.Title>
                </LinkCard>
            )}
            {!loading && !error && data != null && data.person == null && (
                <Alert variant="warning" className="mt-4">
                    <Heading size="small" level="3">
                        Fant ikke pasient
                    </Heading>
                    <BodyShort>Det angitte fødselsnummeret eller d-nummeret finnes ikke.</BodyShort>
                </Alert>
            )}
            {!loading && error && (
                <Alert variant="error" className="mt-4">
                    <Heading size="small" level="3">
                        Kunne ikke hente pasient
                    </Heading>
                    <BodyShort>Det oppstod en feil ved henting av pasient. Prøv igjen senere.</BodyShort>
                </Alert>
            )}
        </div>
    )
}

export default ManualPatientPicker
