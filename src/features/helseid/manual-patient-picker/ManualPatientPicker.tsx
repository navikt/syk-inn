'use client'

import { useLazyQuery } from '@apollo/client/react'
import { ChevronRightIcon } from '@navikt/aksel-icons'
import { BodyShort, Detail, Heading, Skeleton } from '@navikt/ds-react'
import { AnimatePresence } from 'motion/react'
import React, { ReactElement, useCallback, useEffect, useState } from 'react'

import { SimpleReveal } from '#components/animation/Reveal'
import { SimpleAlert } from '#components/help/GeneralErrors'
import { TwoPaneGrid } from '#components/layout/TwoPaneGrid'
import { ShortcutButtonLink } from '#components/shortcut/ShortcutButtons'
import { HelseIdPaths } from '#core/providers/ModePaths'
import { useAppDispatch, useAppSelector } from '#core/redux/hooks'
import { nySykmeldingActions } from '#core/redux/reducers/ny-sykmelding'
import { setPersistentUser } from '#data-layer/helseid/persistent-user/persistent-user'
import { DevGcpScenariosSectionLazy } from '#dev/dev-gcp-scenarios/lazy'
import { FORM_VARIANT_KEY, NySykmeldingFormVariantType } from '#features/ny-sykmelding-form/useFormVariant'
import { isDevGcp, isLocal } from '#lib/env'
import { PersonByIdentDocument } from '#queries'

import { ManualPatientDrafts } from './ManualPatientDrafts'
import { ManualPatientSearch } from './ManualPatientSearch'

export function ManualPatientPicker(): ReactElement {
    const dispatch = useAppDispatch()
    const existingPatient = useAppSelector((state) => state.nySykmelding.pasient)
    const [currentPatient, setCurrentPatient] = useState<string | null>(null)
    const [searchPerson, { loading, data, error }] = useLazyQuery(PersonByIdentDocument, {
        fetchPolicy: 'cache-first',
    })

    const handleSearch = useCallback(
        async (ident: string): Promise<void> => {
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
        },
        [dispatch, searchPerson],
    )

    useEffect(() => {
        if (existingPatient?.ident) {
            void handleSearch(existingPatient.ident)
        }
    }, [handleSearch, existingPatient?.ident])

    useEffect(() => {
        /**
         * Make sure form is clear of any draft or submitted sykmeldinger when returning to the
         * patient picker.
         */
        dispatch(nySykmeldingActions.reset())
    }, [dispatch])

    return (
        <TwoPaneGrid tag="div">
            <div className="p-4 bg-ax-bg-default rounded-xl">
                <ManualPatientSearch handleSearch={handleSearch} defaultIdent={existingPatient?.ident} />
                {loading && (
                    <div className="border-t border-t-ax-border-neutral-subtle mt-4 pt-4">
                        <div className="mb-4">
                            <Skeleton variant="text" width={240} height={32} />
                            <Skeleton variant="text" width={84} height={18} />
                            <Skeleton variant="text" width={120} height={24} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <Skeleton height={48} variant="rounded" />
                            <Skeleton height={48} variant="rounded" />
                            <Skeleton height={48} variant="rounded" />
                        </div>
                    </div>
                )}
                {!loading && data?.person != null && (
                    <div className="border-t border-t-ax-border-neutral-subtle mt-4 pt-4">
                        <div className="mb-4">
                            <Heading level="3" size="medium">
                                Ny sykmelding for {data.person.navn}
                            </Heading>
                            <div>
                                <Detail className="font-ax-bold">ID-nummer</Detail>
                                <BodyShort>{data.person.ident}</BodyShort>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <ShortcutButtonLink
                                href={HelseIdPaths.ny}
                                variant="primary"
                                loading={loading}
                                iconPosition="right"
                                icon={<ChevronRightIcon aria-hidden />}
                                className="w-full"
                                buttonClassName="w-full"
                                shortcut={{
                                    modifier: 'alt',
                                    code: 'KeyN',
                                    hintPlacement: 'bottom-start',
                                }}
                            >
                                Opprett ny sykmelding
                            </ShortcutButtonLink>
                            <ShortcutButtonLink
                                href={`${HelseIdPaths.ny}?${FORM_VARIANT_KEY}=${'REISETILSKUDD' satisfies NySykmeldingFormVariantType}`}
                                variant="secondary"
                                loading={loading}
                                iconPosition="right"
                                icon={<ChevronRightIcon aria-hidden />}
                                className="w-full"
                                buttonClassName="w-full"
                                shortcut={{
                                    modifier: 'alt',
                                    code: 'KeyM',
                                    hintPlacement: 'bottom-start',
                                }}
                            >
                                Opprett sykmelding med reisetilskudd
                            </ShortcutButtonLink>
                            <ShortcutButtonLink
                                href={`${HelseIdPaths.ny}?${FORM_VARIANT_KEY}=${'BEHANDLINGSDAGER' satisfies NySykmeldingFormVariantType}`}
                                variant="secondary"
                                loading={loading}
                                iconPosition="right"
                                icon={<ChevronRightIcon aria-hidden />}
                                className="w-full"
                                buttonClassName="w-full"
                                shortcut={{
                                    modifier: 'alt',
                                    code: 'KeyB',
                                    hintPlacement: 'bottom-start',
                                }}
                            >
                                Opprett sykmelding med behandlingsdager
                            </ShortcutButtonLink>
                        </div>
                    </div>
                )}

                {!loading && !error && data != null && data.person == null && (
                    <SimpleAlert level="warning" className="mt-4" title="Fant ikke pasient" noCallToAction>
                        Det angitte fødselsnummeret eller d-nummeret finnes ikke.
                    </SimpleAlert>
                )}
                {!loading && error && (
                    <SimpleAlert level="error" className="mt-4" title="Kunne ikke hente pasient">
                        Det oppstod en feil ved henting av pasient. Prøv igjen senere.
                    </SimpleAlert>
                )}

                <AnimatePresence initial={false}>
                    {!loading && data?.person != null && currentPatient != null && (
                        <SimpleReveal>
                            <ManualPatientDrafts ident={data.person.ident} />
                        </SimpleReveal>
                    )}
                </AnimatePresence>
            </div>
            {(isLocal || isDevGcp) && <DevGcpScenariosSectionLazy search={handleSearch} />}
        </TwoPaneGrid>
    )
}
