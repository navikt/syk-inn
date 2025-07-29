import { Alert, BodyShort, Checkbox, Heading } from '@navikt/ds-react'
import React, { ReactElement } from 'react'
import { PaperplaneIcon } from '@navikt/aksel-icons'
import { AnimatePresence } from 'motion/react'
import { useQuery } from '@apollo/client'

import { SimpleReveal } from '@components/animation/Reveal'
import { BehandlerDocument, OutcomeFragment } from '@data-layer/graphql/queries.generated'
import { ShortcutButton } from '@components/shortcut/ShortcutButton'
import { useAppDispatch, useAppSelector } from '@core/redux/hooks'
import { nySykmeldingMultistepActions } from '@core/redux/reducers/ny-sykmelding-multistep'

import BehandlerSummary from '../summary/BehandlerSummary'
import FormValuesSummary from '../summary/FormValuesSummary'
import ForkastDraftButton from '../draft/DraftActions'
import { useFormStep } from '../steps/useFormStep'
import { useOpprettSykmeldingMutation } from '../useOpprettSykmeldingMutation'

import styles from './SummarySection.module.css'

function SummarySection(): ReactElement {
    const [, setStep] = useFormStep()
    const formState = useAppSelector((state) => state.nySykmeldingMultistep)
    const nySykmelding = useOpprettSykmeldingMutation()
    const dispatch = useAppDispatch()
    const behandlerQuery = useQuery(BehandlerDocument)

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

                <div className="flex flex-col gap-3 justify-end items-end">
                    <Checkbox
                        value={formState.skalSkjermes ?? false}
                        onChange={(e) => dispatch(nySykmeldingMultistepActions.setSkalSkjermes(e.target.checked))}
                    >
                        <option>Pasienten skal skjermes for medisinske opplysninger</option>
                    </Checkbox>

                    <div className="flex gap-3">
                        <ForkastDraftButton />
                        <ShortcutButton
                            variant="secondary"
                            onClick={() => setStep('main')}
                            disabled={nySykmelding.result.loading}
                            shortcut={{
                                modifier: 'alt',
                                key: 'arrowleft',
                            }}
                        >
                            Forrige steg
                        </ShortcutButton>
                        <ShortcutButton
                            variant="primary"
                            icon={<PaperplaneIcon aria-hidden />}
                            iconPosition="right"
                            loading={nySykmelding.result.loading || behandlerQuery.loading}
                            onClick={() => nySykmelding.opprettSykmelding()}
                            shortcut={{
                                modifier: 'alt',
                                key: 'n',
                            }}
                        >
                            Send inn
                        </ShortcutButton>
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
