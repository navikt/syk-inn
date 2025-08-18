import { Alert, BodyShort, Button, Checkbox, Heading } from '@navikt/ds-react'
import React, { ReactElement } from 'react'
import { PaperplaneIcon } from '@navikt/aksel-icons'
import { AnimatePresence } from 'motion/react'
import { useQuery } from '@apollo/client'

import { BehandlerDocument, OutcomeFragment, PasientWithExistsDocument } from '@queries'
import { SimpleReveal } from '@components/animation/Reveal'
import { ShortcutButtons } from '@components/shortcut/ShortcutButtons'
import { useAppDispatch, useAppSelector } from '@core/redux/hooks'
import { nySykmeldingActions } from '@core/redux/reducers/ny-sykmelding'

import BehandlerSummary from '../summary/BehandlerSummary'
import FormValuesSummary from '../summary/FormValuesSummary'
import ForkastDraftButton from '../draft/DraftActions'
import { useFormStep } from '../steps/useFormStep'
import { useOpprettSykmeldingMutation } from '../useOpprettSykmeldingMutation'

import styles from './SummarySection.module.css'

function SummarySection(): ReactElement {
    const [, setStep] = useFormStep()
    const formState = useAppSelector((state) => state.nySykmelding)
    const nySykmelding = useOpprettSykmeldingMutation()
    const dispatch = useAppDispatch()
    const behandlerQuery = useQuery(BehandlerDocument)
    const pasientQuery = useQuery(PasientWithExistsDocument, {
        notifyOnNetworkStatusChange: true,
    })

    return (
        <div className={styles.summaryGrid}>
            <FormValuesSummary className="w-[65ch] max-w-prose row-span-2" />
            <BehandlerSummary className="w-[65ch] max-w-prose" />

            <div className="flex flex-col gap-3 justify-end w-[65ch] max-w-prose">
                <AnimatePresence>
                    {nySykmelding.result?.data?.opprettSykmelding.__typename === 'OpprettSykmeldingRuleOutcome' && (
                        <SimpleReveal>
                            <RuleOutcomeWarning outcome={nySykmelding.result.data.opprettSykmelding} />
                        </SimpleReveal>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {nySykmelding.result.error && (
                        <SimpleReveal>
                            <UnknownErrorAlert error={nySykmelding.result.error} />
                        </SimpleReveal>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {!pasientQuery.loading && pasientQuery.error != null && (
                        <UnableToVerifyPersonsExistence
                            refetching={pasientQuery.loading}
                            refetch={pasientQuery.refetch}
                        />
                    )}
                    {!pasientQuery.loading && !pasientQuery.data?.pasient?.userExists && (
                        <SimpleReveal>
                            {pasientQuery.data?.pasient?.userExists == null ? (
                                <UnableToVerifyPersonsExistence
                                    refetching={pasientQuery.loading}
                                    refetch={pasientQuery.refetch}
                                />
                            ) : (
                                <PasientDoesNotExistAlert {...pasientQuery.data.pasient} />
                            )}
                        </SimpleReveal>
                    )}
                </AnimatePresence>

                <div className="flex flex-col gap-3 justify-end items-end">
                    <Checkbox
                        value={formState.summary?.skalSkjermes ?? false}
                        onChange={(e) => dispatch(nySykmeldingActions.setSkalSkjermes(e.target.checked))}
                    >
                        <option>Pasienten skal skjermes for medisinske opplysninger</option>
                    </Checkbox>

                    <div className="flex gap-3">
                        <ForkastDraftButton />
                        <ShortcutButtons
                            variant="secondary"
                            onClick={() => setStep('main')}
                            disabled={nySykmelding.result.loading}
                            shortcut={{
                                modifier: 'alt',
                                key: 'arrowleft',
                            }}
                        >
                            Forrige steg
                        </ShortcutButtons>
                        <ShortcutButtons
                            variant="primary"
                            icon={<PaperplaneIcon aria-hidden />}
                            iconPosition="right"
                            disabled={!pasientQuery.data?.pasient?.userExists}
                            loading={nySykmelding.result.loading || behandlerQuery.loading || pasientQuery.loading}
                            onClick={() => nySykmelding.opprettSykmelding()}
                            shortcut={{
                                modifier: 'alt',
                                key: 'n',
                            }}
                        >
                            Send inn
                        </ShortcutButtons>
                    </div>
                </div>
            </div>
        </div>
    )
}

function RuleOutcomeWarning({ outcome }: { outcome: OutcomeFragment }): ReactElement {
    return (
        <Alert variant="warning">
            <Heading size="medium" level="3" spacing>
                Sykmeldingen ble ikke sendt inn på grunn av regelsjekk
            </Heading>
            <BodyShort spacing>
                Sykmeldingen ble fylt ut rett, men den traff på en regel som gjorde at sykmeldingen ikke ville blitt
                godkjent hos Nav.
            </BodyShort>
            <BodyShort>
                Teknisk regelnavn:{' '}
                <code className="text-sm">
                    {outcome.tree} - {outcome.rule}
                </code>
            </BodyShort>
        </Alert>
    )
}

function PasientDoesNotExistAlert({ navn, ident }: { navn: string; ident: string }): ReactElement {
    return (
        <Alert variant="warning">
            <Heading size="small" level="3" spacing>
                Fant ikke {navn} ({ident}) i folkeregisteret.
            </Heading>
            <BodyShort spacing>
                Det ser ut som pasienten du prøver å sende inn sykmeldingen for ikke finnes i Navs systemer.
            </BodyShort>
            <BodyShort spacing>
                Dersom du mener dette er en feil, vennligst kontakt lege- og behandlertelefon.
            </BodyShort>
        </Alert>
    )
}

function UnableToVerifyPersonsExistence({
    refetching,
    refetch,
}: {
    refetching: boolean
    refetch: () => void
}): ReactElement {
    return (
        <Alert variant="error">
            <Heading size="small" level="3" spacing>
                Kunne ikke bekrefte at personen finnes folkeregisteret
            </Heading>
            <BodyShort spacing>
                Dette kan skyldes at et bakoverliggende system er nede. Du vil ikke kunne sende inn sykmeldingen akkurat
                nå. Du kan lagre utkastet og prøve igjen senere.
            </BodyShort>
            <BodyShort spacing>Dersom problemet vedvarer, vennligst kontakt lege- og behandlertelefon.</BodyShort>
            <Button size="xsmall" onClick={() => refetch()} variant="secondary-neutral" loading={refetching}>
                Prøv på nytt
            </Button>
        </Alert>
    )
}

function UnknownErrorAlert({ error }: { error: Error }): ReactElement {
    return (
        <Alert variant="error">
            <Heading size="medium" level="3" spacing>
                Ukjent feil
            </Heading>
            <BodyShort spacing>
                Det skjedde en ukjent feil under innsending av sykmeldingen. Du kan lagre utkastet og prøve å sende inn
                sykmeldingen senere.
            </BodyShort>
            <BodyShort spacing>Dersom problemet vedvarer, må du kontakte lege- og behandlertelefon.</BodyShort>
            <BodyShort size="small">Teknisk sporingstekst: {error.message}</BodyShort>
        </Alert>
    )
}

export default SummarySection
