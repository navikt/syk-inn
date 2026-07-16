import { ApolloLink } from '@apollo/client'
import { useApolloClient } from '@apollo/client/react'
import { ExclamationmarkTriangleIcon } from '@navikt/aksel-icons'
import { BodyShort, Chips, Detail, Heading } from '@navikt/ds-react'
import { logger } from '@navikt/next-logger'
import React, { ReactElement, useEffect, useState } from 'react'
import { tap } from 'rxjs'

import { PersonFragment } from '#queries'

type PersistablePatient = { ident: string; navn: string }

interface PreviousPatientsListProps {
    search: (ident: string) => Promise<void>
}

export function PreviousPatientsList({ search }: PreviousPatientsListProps): ReactElement {
    const client = useApolloClient()
    const [idents, setIdents] = useState<PersistablePatient[]>(restoreFromLocalStorage())
    const [previousIdent, setPreviousIdent] = useState<string | null>(null)
    const addNew = (person: PersistablePatient): void => {
        setIdents((prev) => {
            const updated = prev.find((it) => it.ident === person.ident) ? prev : [...prev, person]
            persistToLocalStorage(updated)
            return updated
        })
        setPreviousIdent(person.ident)
    }

    useEffect(() => {
        const originalLink = client.link

        const observerLink = new ApolloLink((operation, forward) => {
            const observable = forward(operation)
            if (operation.operationName !== 'PersonByIdent') return observable

            return observable.pipe(
                tap((result) => {
                    const person = (result.data as { person?: PersonFragment } | undefined)?.person

                    if (person?.__typename === 'QueriedPerson') {
                        addNew(person)
                    }
                }),
            )
        })

        client.setLink(observerLink.concat(originalLink))

        return () => {
            client.setLink(originalLink)
        }
    }, [client])

    return (
        <div>
            <Detail className="flex gap-1 items-center">
                <ExclamationmarkTriangleIcon aria-hidden />
                Dette er verktøy kun for dev-miljø
            </Detail>
            <Heading size="xsmall" level="3" spacing>
                Tidligere brukte pasienter
            </Heading>
            {idents.length > 0 ? (
                <Chips size="small">
                    {idents.map((person) => (
                        <Chips.Toggle
                            key={person.ident}
                            checkmark={false}
                            selected={previousIdent === person.ident}
                            onClick={async () => {
                                setPreviousIdent(person.ident)
                                await search(person.ident)
                            }}
                        >
                            {`${person.navn} (${person.ident})`}
                        </Chips.Toggle>
                    ))}
                </Chips>
            ) : (
                <BodyShort size="small" className="italic">
                    Ingen tidligere pasienter
                </BodyShort>
            )}
        </div>
    )
}

function restoreFromLocalStorage(): PersistablePatient[] {
    try {
        const stored = localStorage.getItem('dev-gcp-previous-patients')
        return stored ? JSON.parse(stored) : []
    } catch (e) {
        logger.error(new Error('Failed to restore previous patients from localStorage', { cause: e }))
        return []
    }
}

function persistToLocalStorage(patients: PersistablePatient[]): void {
    try {
        localStorage.setItem('dev-gcp-previous-patients', JSON.stringify(patients))
    } catch (e) {
        logger.error(new Error('Failed to persist previous patients to localStorage', { cause: e }))
    }
}
