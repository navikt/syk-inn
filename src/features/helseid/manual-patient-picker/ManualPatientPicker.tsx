'use client'

import React, { ReactElement, useEffect, useState } from 'react'
import { LinkCard, LocalAlert, Skeleton } from '@navikt/ds-react'
import { useLazyQuery } from '@apollo/client/react'
import Link from 'next/link'
import { AnimatePresence } from 'motion/react'

import { PersonByIdentDocument } from '@queries'
import { useAppDispatch, useAppSelector } from '@core/redux/hooks'
import { nySykmeldingActions } from '@core/redux/reducers/ny-sykmelding'
import { setPersistentUser } from '@data-layer/helseid/persistent-user/persistent-user'
import { SimpleReveal } from '@components/animation/Reveal'

import ManualPatientSearch from './ManualPatientSearch'
import ManualPatientDrafts from './ManualPatientDrafts'

function ManualPatientPicker(): ReactElement {
    const dispatch = useAppDispatch()
    const existingPatient = useAppSelector((state) => state.nySykmelding.pasient)
    const [currentPatient, setCurrentPatient] = useState<string | null>(null)
    const [searchPerson, { loading, data, error }] = useLazyQuery(PersonByIdentDocument, {
        fetchPolicy: 'network-only',
    })
    const handleSearch = async (ident: string): Promise<void> => {
        if (!ident) return

        setCurrentPatient(null)
        const pdlPerson = await searchPerson({
            variables: { ident: ident },
        })

        if (pdlPerson.data?.person) {
            const patient = {
                type: 'manual' as const,
                ident: pdlPerson.data.person.ident,
                navn: pdlPerson.data.person.navn,
            }
            dispatch(nySykmeldingActions.manualPatient(patient))
            setPersistentUser(patient)
            setCurrentPatient(patient.ident)
        }
    }

    useEffect(() => {
        /**
         * Make sure form is clear of any draft or submitted sykmeldinger when returning to the
         * patient picker.
         */
        dispatch(nySykmeldingActions.reset())
    }, [dispatch])

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
                <LocalAlert status="warning" className="mt-4">
                    <LocalAlert.Header>
                        <LocalAlert.Title>Fant ikke pasient</LocalAlert.Title>
                    </LocalAlert.Header>
                    <LocalAlert.Content>Det angitte fødselsnummeret eller d-nummeret finnes ikke.</LocalAlert.Content>
                </LocalAlert>
            )}
            {!loading && error && (
                <LocalAlert status="error" className="mt-4">
                    <LocalAlert.Header>
                        <LocalAlert.Title>Kunne ikke hente pasient</LocalAlert.Title>
                    </LocalAlert.Header>
                    <LocalAlert.Content>
                        Det oppstod en feil ved henting av pasient. Prøv igjen senere.
                    </LocalAlert.Content>
                </LocalAlert>
            )}

            <AnimatePresence initial={false}>
                {!loading && data?.person != null && currentPatient != null && (
                    <SimpleReveal>
                        <ManualPatientDrafts ident={data.person.ident} />
                    </SimpleReveal>
                )}
            </AnimatePresence>
        </div>
    )
}

export default ManualPatientPicker
