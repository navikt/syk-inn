import { Alert, BodyShort, Checkbox, Heading } from '@navikt/ds-react'
import { PaperplaneIcon } from '@navikt/aksel-icons'
import React, { ReactElement } from 'react'
import { AnimatePresence } from 'motion/react'
import { useQuery } from '@apollo/client/react'

import { BehandlerDocument } from '@queries'
import { SimpleReveal } from '@components/animation/Reveal'
import { ShortcutButtons } from '@components/shortcut/ShortcutButtons'
import { useAppDispatch, useAppSelector } from '@core/redux/hooks'
import { nySykmeldingActions } from '@core/redux/reducers/ny-sykmelding'
import { LocalAndDemoBonusActionMenu } from '@dev/tools/LocalAndDemoBonusActionMenu'
import { RuleHitSendAnywayModal } from '@features/ny-sykmelding-form/summary/rules/RuleHitSendAnywayModal'
import { useSubmitRuleState } from '@features/ny-sykmelding-form/summary/rules/useSubmitRuleState'
import { UnknownSystemError, SpecificErrorAlert } from '@components/help/GeneralErrors'
import { isDemo, isLocal } from '@lib/env'

import BehandlerSummary from '../summary/BehandlerSummary'
import FormValuesSummary from '../summary/FormValuesSummary'
import ForkastDraftButton from '../draft/DraftActions'
import { useFormStep } from '../steps/useFormStep'
import { useOpprettSykmeldingMutation } from '../useOpprettSykmeldingMutation'

import styles from './SummarySection.module.css'

function SummarySection(): ReactElement {
    const [, setStep] = useFormStep()
    const formState = useAppSelector((state) => state.nySykmelding)
    const [ruleOutcomeState, { ruled, close }] = useSubmitRuleState()
    const nySykmelding = useOpprettSykmeldingMutation(ruled)
    const dispatch = useAppDispatch()
    const behandlerQuery = useQuery(BehandlerDocument)

    return (
        <div className={styles.summaryGrid}>
            <FormValuesSummary className="w-[65ch] max-w-prose row-span-2" />
            <BehandlerSummary className="w-[65ch] max-w-prose" />

            <div className="flex flex-col gap-3 justify-end w-[65ch] max-w-prose">
                <AnimatePresence>
                    {nySykmelding.mutation.result?.data?.opprettSykmelding.__typename === 'RuleOutcome' &&
                        ruleOutcomeState.type === 'modal-closed' && (
                            <SimpleReveal>
                                <RuleOutcomeWarning />
                            </SimpleReveal>
                        )}
                    {nySykmelding.mutation.result?.data?.opprettSykmelding.__typename === 'OtherSubmitOutcomes' && (
                        <SimpleReveal>
                            <PatientDoesNotExistAlert ident={formState.pasient?.ident} navn={formState.pasient?.navn} />
                        </SimpleReveal>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {nySykmelding.mutation.result.error && (
                        <SimpleReveal>
                            <UnknownSystemError />
                        </SimpleReveal>
                    )}
                </AnimatePresence>

                {ruleOutcomeState.type === 'rule-outcome' && (
                    <RuleHitSendAnywayModal
                        nySykmelding={nySykmelding}
                        outcome={ruleOutcomeState.outcome}
                        onModalClose={close}
                    />
                )}

                <div className="flex flex-col gap-3 justify-end items-end">
                    <Checkbox
                        value={formState.summary?.skalSkjermes ?? false}
                        onChange={(e) => dispatch(nySykmeldingActions.setSkalSkjermes(e.target.checked))}
                    >
                        <option>Pasienten skal skjermes for medisinske opplysninger</option>
                    </Checkbox>

                    <div className="flex gap-3">
                        <ForkastDraftButton inactive={ruleOutcomeState.type === 'rule-outcome'} />
                        <ShortcutButtons
                            variant="secondary"
                            onClick={() => setStep('main')}
                            disabled={nySykmelding.mutation.result.loading}
                            shortcut={{
                                modifier: 'alt',
                                key: 'arrowleft',
                            }}
                            inactive={ruleOutcomeState.type === 'rule-outcome'}
                        >
                            Forrige steg
                        </ShortcutButtons>
                        <ShortcutButtons
                            variant="primary"
                            icon={<PaperplaneIcon aria-hidden />}
                            iconPosition="right"
                            disabled={
                                nySykmelding.mutation.result.data?.opprettSykmelding.__typename ===
                                'OtherSubmitOutcomes'
                            }
                            loading={nySykmelding.mutation.result.loading || behandlerQuery.loading}
                            onClick={() => nySykmelding.mutation.opprettSykmelding()}
                            shortcut={{
                                modifier: 'alt',
                                key: 'n',
                            }}
                            inactive={ruleOutcomeState.type === 'rule-outcome'}
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

function RuleOutcomeWarning(): ReactElement {
    return (
        <SpecificErrorAlert
            title="Sykmeldingen ble ikke sendt inn på grunn av regelsjekk"
            level="warning"
            noCallToAction
        >
            For å sende inn sykmeldingen, så kan du gå videre, og bekrefte at du ønsker å sende inn sykmeldingen til
            tross for regelutfallet.
        </SpecificErrorAlert>
    )
}

function PatientDoesNotExistAlert({
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

export default SummarySection
