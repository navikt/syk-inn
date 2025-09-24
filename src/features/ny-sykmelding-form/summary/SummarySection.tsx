import { ActionMenu, Alert, BodyShort, Button, Checkbox, Heading } from '@navikt/ds-react'
import { MenuElipsisVerticalIcon, PaperplaneIcon, TerminalIcon } from '@navikt/aksel-icons'
import React, { ReactElement } from 'react'
import { AnimatePresence } from 'motion/react'
import { useQuery } from '@apollo/client/react'
import { useQueryState } from 'nuqs'

import { BehandlerDocument, RuleOutcomeFragment, PasientWithExistsDocument } from '@queries'
import { SimpleReveal } from '@components/animation/Reveal'
import { ShortcutButtons } from '@components/shortcut/ShortcutButtons'
import { useAppDispatch, useAppSelector } from '@core/redux/hooks'
import { nySykmeldingActions } from '@core/redux/reducers/ny-sykmelding'
import { MockRuleMarkers } from '@dev/mock-engine/SykInnApiMockRuleMarkers'
import { isDemo, isLocal } from '@lib/env'

import BehandlerSummary from '../summary/BehandlerSummary'
import FormValuesSummary from '../summary/FormValuesSummary'
import ForkastDraftButton from '../draft/DraftActions'
import { useFormStep } from '../steps/useFormStep'
import { UseOpprettSykmeldingMutation, useOpprettSykmeldingMutation } from '../useOpprettSykmeldingMutation'

import styles from './SummarySection.module.css'

function SummarySection(): ReactElement {
    const [, setStep] = useFormStep()
    const formState = useAppSelector((state) => state.nySykmelding)
    const nySykmelding = useOpprettSykmeldingMutation()
    const dispatch = useAppDispatch()
    const behandlerQuery = useQuery(BehandlerDocument)
    const pasientQuery = useQuery(PasientWithExistsDocument)

    return (
        <div className={styles.summaryGrid}>
            <FormValuesSummary className="w-[65ch] max-w-prose row-span-2" />
            <BehandlerSummary className="w-[65ch] max-w-prose" />

            <div className="flex flex-col gap-3 justify-end w-[65ch] max-w-prose">
                <AnimatePresence>
                    {nySykmelding.mutation.result?.data?.opprettSykmelding.__typename === 'RuleOutcome' && (
                        <SimpleReveal>
                            <RuleOutcomeWarning outcome={nySykmelding.mutation.result.data.opprettSykmelding} />
                        </SimpleReveal>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {nySykmelding.mutation.result.error && (
                        <SimpleReveal>
                            <UnknownErrorAlert error={nySykmelding.mutation.result.error} />
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
                            disabled={nySykmelding.mutation.result.loading}
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
                            loading={
                                nySykmelding.mutation.result.loading || behandlerQuery.loading || pasientQuery.loading
                            }
                            onClick={() => nySykmelding.mutation.opprettSykmelding()}
                            shortcut={{
                                modifier: 'alt',
                                key: 'n',
                            }}
                        >
                            Send inn
                        </ShortcutButtons>
                        {(isLocal || isDemo) && <LocalAndDemoBonusActionMenu mutation={nySykmelding.mutation} />}
                    </div>
                </div>
            </div>
        </div>
    )
}

function RuleOutcomeWarning({ outcome }: { outcome: RuleOutcomeFragment }): ReactElement {
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

function PasientDoesNotExistAlert({
    navn,
    ident,
}: {
    navn: string | undefined
    ident: string | undefined
}): ReactElement {
    return (
        <Alert variant="warning">
            {navn && ident ? (
                <Heading size="small" level="3" spacing>
                    Fant ikke {navn} ({ident}) i folkeregisteret.
                </Heading>
            ) : (
                <Heading size="small" level="3" spacing>
                    Kunne ikke bekrefte pasientens identitet.
                </Heading>
            )}
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

function LocalAndDemoBonusActionMenu({
    mutation,
}: {
    mutation: UseOpprettSykmeldingMutation['mutation']
}): ReactElement {
    const [, setVerifySendOverride] = useQueryState(MockRuleMarkers.query)

    return (
        <ActionMenu>
            <ActionMenu.Trigger>
                <Button
                    variant="tertiary-neutral"
                    loading={mutation.result.loading}
                    icon={
                        <figure title="Flere demo-handlinger" className="relative">
                            <TerminalIcon aria-hidden />
                            <div className="bg-bg-subtle h-2 w-2  absolute top-0 right-1.25" />
                            <MenuElipsisVerticalIcon
                                aria-hidden
                                className="absolute -top-[6px] -right-[3px] animate-bounce"
                            />
                        </figure>
                    }
                    iconPosition="right"
                />
            </ActionMenu.Trigger>
            <ActionMenu.Content>
                <ActionMenu.Group label="Send sykmelding som blir...">
                    <ActionMenu.Item
                        onSelect={async () => {
                            await setVerifySendOverride('invalid')
                            await mutation.opprettSykmelding()
                        }}
                    >
                        Avvist (forventet)
                    </ActionMenu.Item>
                    <ActionMenu.Item
                        onSelect={async () => {
                            await setVerifySendOverride('manual')
                            await mutation.opprettSykmelding()
                        }}
                    >
                        Manuell behandling (forventet)
                    </ActionMenu.Item>
                    <ActionMenu.Item
                        onSelect={async () => {
                            await setVerifySendOverride('invalid-unexpected')
                            await mutation.opprettSykmelding()
                        }}
                    >
                        Avvist med uforventet regelbrudd
                    </ActionMenu.Item>
                </ActionMenu.Group>
                <ActionMenu.Group label="Fjern regeloverstyring">
                    <ActionMenu.Item
                        onSelect={async () => {
                            await setVerifySendOverride(null)
                            await mutation.opprettSykmelding()
                        }}
                    >
                        Send uten overstyring
                    </ActionMenu.Item>
                </ActionMenu.Group>
            </ActionMenu.Content>
        </ActionMenu>
    )
}

export default SummarySection
