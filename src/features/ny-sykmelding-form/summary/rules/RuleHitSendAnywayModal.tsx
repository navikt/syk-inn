import { ExclamationmarkTriangleIcon, InformationSquareIcon, PaperplaneIcon } from '@navikt/aksel-icons'
import { BodyShort, Heading, Link, Modal } from '@navikt/ds-react'
import React, { ReactElement, useState } from 'react'

import { UnknownSystemError } from '#components/help/GeneralErrors'
import { ShortcutButton } from '#components/shortcut/ShortcutButtons'
import { RuleOutcomeFragment } from '#queries'

import { useFormStep } from '../../useFormStep'
import { UseOpprettSykmeldingMutation } from '../../useOpprettSykmeldingMutation'

import { getRuleText } from './rule-texts'

/**
 * Annoyingly complex flow:
 *
 * - User submits
 *   → gets rule hit
 *   → is shown modal, considers rule outcome
 *   → submits anyway → uses mutation again with force=true
 *   → submits anyway → needs to show "unknown error" if it fails inside the modal
 *
 *  Alternatively:
 *  - User submits:
 *    → person does not exist
 *    → user is shown an alert, no modal (this component)
 *    → is not able to forcefully submit
 */
export function RuleHitSendAnywayModal({
    outcome,
    nySykmelding,
    onModalClose,
}: {
    outcome: RuleOutcomeFragment
    nySykmelding: UseOpprettSykmeldingMutation
    onModalClose: () => void
}): ReactElement | null {
    const [, setStep] = useFormStep()
    const [hasSubmittedAnyway, setHasSubmittedAnyway] = useState(false)
    const ruleText: string | null = getRuleText(outcome.rule) ?? null
    const explanation =
        outcome.status === 'INVALID'
            ? 'ikke bli godkjent for innsending til arbeidsgiver eller bekreftelse til Nav'
            : 'gå til manuell behandling'

    return (
        <Modal
            open
            header={{
                heading: 'Vær oppmerksom',
                icon: <ExclamationmarkTriangleIcon aria-hidden />,
            }}
            onClose={onModalClose}
            onCancel={onModalClose}
            onBeforeClose={() => {
                onModalClose()
                return false
            }}
        >
            <Modal.Body>
                <BodyShort spacing>Sykmeldingen kan sendes til Nav, men vil {explanation}.</BodyShort>

                <Heading size="xsmall" level="4" className="flex items-center gap-1">
                    <InformationSquareIcon aria-hidden className="-mt-0.5" />
                    Forklaring
                </Heading>
                <BodyShort spacing className="italic">
                    {ruleText}
                </BodyShort>
                <BodyShort>
                    Dersom du velger å sende inn sykmeldingen vil brukeren kunne se den på{' '}
                    <Link href="https://www.nav.no/syk/sykefravaer" target="_blank">
                        Ditt Sykefravær
                    </Link>{' '}
                    på nav.no, men den vil være markert som{' '}
                    {outcome.status === 'INVALID' ? 'ugyldig' : 'under manuell behandling'}.
                </BodyShort>

                {hasSubmittedAnyway && nySykmelding.mutation.result.error && <UnknownSystemError className="mt-2" />}
            </Modal.Body>
            <Modal.Footer>
                <ShortcutButton
                    variant="danger"
                    icon={<PaperplaneIcon aria-hidden />}
                    iconPosition="right"
                    loading={nySykmelding.mutation.result.loading}
                    onClick={async () => {
                        await nySykmelding.mutation.opprettSykmelding(true).finally(() => setHasSubmittedAnyway(true))
                    }}
                    shortcut={{
                        modifier: 'alt',
                        code: 'KeyN',
                    }}
                >
                    Send inn
                </ShortcutButton>
                <ShortcutButton
                    variant="secondary"
                    iconPosition="right"
                    disabled={!open || nySykmelding.mutation.result.loading}
                    onClick={() => setStep('main')}
                    shortcut={{
                        modifier: 'alt',
                        code: 'ArrowLeft',
                    }}
                >
                    Endre opplysninger
                </ShortcutButton>
            </Modal.Footer>
        </Modal>
    )
}
