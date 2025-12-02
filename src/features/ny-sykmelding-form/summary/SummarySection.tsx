import { Checkbox } from '@navikt/ds-react'
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
import { SimpleAlert, UnknownSystemError } from '@components/help/GeneralErrors'
import { isDemo, isLocal } from '@lib/env'
import { OtherOutcomesAlert } from '@features/ny-sykmelding-form/summary/explanations/OtherOutcomesErrors'
import TwoPaneGrid from '@components/layout/TwoPaneGrid'

import FormValuesSummary from '../summary/FormValuesSummary'
import { ForkastDraftButton } from '../draft/DraftActions'
import { useFormStep } from '../steps/useFormStep'
import { useOpprettSykmeldingMutation } from '../useOpprettSykmeldingMutation'

import BehandlerSummary from './behandler/BehandlerSummary'
import { HardStop } from './explanations/HardStop'

function SummarySection(): ReactElement {
    const [, setStep] = useFormStep()
    const formState = useAppSelector((state) => state.nySykmelding)
    const [ruleOutcomeState, { ruled, close, reset }] = useSubmitRuleState()
    const nySykmelding = useOpprettSykmeldingMutation(ruled, reset)
    const dispatch = useAppDispatch()
    const behandlerQuery = useQuery(BehandlerDocument)

    return (
        <TwoPaneGrid tag="div">
            <FormValuesSummary />
            <div className="flex flex-col justify-between gap-4">
                <BehandlerSummary />
                <div className="flex flex-col gap-3 justify-end">
                    <AnimatePresence>
                        {ruleOutcomeState.type === 'modal-closed' && (
                            <SimpleReveal>
                                <RuleOutcomeWarning />
                            </SimpleReveal>
                        )}
                        {ruleOutcomeState.type === 'rule-outcome' && ruleOutcomeState.ruleType !== 'soft' && (
                            <SimpleReveal>
                                <HardStop outcome={ruleOutcomeState.outcome} />
                            </SimpleReveal>
                        )}
                        {nySykmelding.mutation.result?.data?.opprettSykmelding.__typename === 'OtherSubmitOutcomes' && (
                            <SimpleReveal>
                                <OtherOutcomesAlert
                                    cause={nySykmelding.mutation.result.data.opprettSykmelding.cause}
                                    ident={formState.pasient?.ident}
                                    navn={formState.pasient?.navn}
                                />
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

                    {ruleOutcomeState.type === 'rule-outcome' && ruleOutcomeState.ruleType === 'soft' && (
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
                            Pasienten skal skjermes for medisinske opplysninger
                        </Checkbox>

                        <div className="flex flex-row flex-wrap md:grid-cols-3 gap-3 lg:justify-end">
                            <ForkastDraftButton
                                className="flex-grow md:max-w-46"
                                inactive={ruleOutcomeState.type === 'rule-outcome'}
                            />
                            <ShortcutButtons
                                className="flex-grow md:max-w-46"
                                variant="secondary"
                                onClick={() => setStep('main')}
                                disabled={nySykmelding.mutation.result.loading}
                                shortcut={{
                                    modifier: 'alt',
                                    code: 'ArrowLeft',
                                }}
                                inactive={ruleOutcomeState.type === 'rule-outcome'}
                            >
                                Forrige steg
                            </ShortcutButtons>
                            <ShortcutButtons
                                className="flex-grow md:max-w-46"
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
                                    code: 'KeyN',
                                }}
                                inactive={ruleOutcomeState.type === 'rule-outcome'}
                            >
                                Send inn
                            </ShortcutButtons>
                        </div>
                        {(isLocal || isDemo) && (
                            <div className="self-end">
                                <LocalAndDemoBonusActionMenu mutation={nySykmelding.mutation} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </TwoPaneGrid>
    )
}

function RuleOutcomeWarning(): ReactElement {
    return (
        <SimpleAlert title="Sykmeldingen ble ikke sendt inn på grunn av regelsjekk" level="warning" noCallToAction>
            For å sende inn sykmeldingen, så kan du gå videre, og bekrefte at du ønsker å sende inn sykmeldingen til
            tross for regelutfallet.
        </SimpleAlert>
    )
}

export default SummarySection
