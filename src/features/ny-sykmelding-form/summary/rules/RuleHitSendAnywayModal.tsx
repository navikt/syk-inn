import React, { ReactElement, useEffect, useState } from 'react'
import { Alert, BodyShort, Detail, Heading, Link, Modal } from '@navikt/ds-react'
import { ExclamationmarkTriangleIcon, InformationSquareIcon, PaperplaneIcon } from '@navikt/aksel-icons'
import { logger } from '@navikt/next-logger'

import { UseOpprettSykmeldingMutation } from '@features/ny-sykmelding-form/useOpprettSykmeldingMutation'
import { ruleTexts } from '@features/ny-sykmelding-form/summary/rules/rule-texts'
import { ShortcutButtons } from '@components/shortcut/ShortcutButtons'
import { RuleOutcomeFragment } from '@queries'
import { UnknownSystemError } from '@components/help/GeneralErrors'
import LegeOgBehandlerTelefonen from '@components/help/LegeOgBehandlerTelefonen'
import { useFormStep } from '@features/ny-sykmelding-form/steps/useFormStep'

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
    const explanation =
        outcome.status === 'INVALID'
            ? 'ikke bli godkjent for innsending til arbeidsgiver eller bekreftelse til Nav'
            : 'gå til manuell behandling'

    const ruleText: string | null = ruleTexts[outcome.rule] ?? null

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

                {ruleText ? (
                    <RuleOutcomeExplanationExpected ruleText={ruleText} status={outcome.status} />
                ) : (
                    <RuleOutcomeExplanationUnexpected outcome={outcome} />
                )}

                {hasSubmittedAnyway && nySykmelding.mutation.result.error && <UnknownSystemError className="mt-2" />}
            </Modal.Body>
            <Modal.Footer>
                <ShortcutButtons
                    variant="danger"
                    icon={<PaperplaneIcon aria-hidden />}
                    iconPosition="right"
                    loading={nySykmelding.mutation.result.loading}
                    onClick={async () => {
                        await nySykmelding.mutation.opprettSykmelding(true).finally(() => setHasSubmittedAnyway(true))
                    }}
                    shortcut={{
                        modifier: 'alt',
                        key: 'n',
                    }}
                >
                    Send inn
                </ShortcutButtons>
                <ShortcutButtons
                    variant="secondary"
                    iconPosition="right"
                    disabled={!open || nySykmelding.mutation.result.loading}
                    onClick={() => setStep('main')}
                    shortcut={{
                        modifier: 'alt',
                        key: 'n',
                    }}
                >
                    Endre opplysninger
                </ShortcutButtons>
            </Modal.Footer>
        </Modal>
    )
}

function RuleOutcomeExplanationExpected({
    status,
    ruleText,
}: {
    status: RuleOutcomeFragment['status']
    ruleText: string
}): ReactElement {
    return (
        <>
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
                på nav.no, men den vil være markert som {status === 'INVALID' ? 'ugyldig' : 'under manuell behandling'}.
            </BodyShort>
        </>
    )
}

function RuleOutcomeExplanationUnexpected({ outcome }: { outcome: RuleOutcomeFragment }): ReactElement {
    useEffect(() => {
        logger.error(`User got unexpected rule outcome when submitting, was ${outcome.rule}`)
    }, [outcome.rule])

    return (
        <>
            <Alert variant="warning" className="mb-2">
                <BodyShort spacing>
                    Denne type regelutfall skal typisk ikke skje i denne løsningen. Vi anbefaler ikke å sende inn
                    sykmeldingen, men å heller lagre utkastet kontakte support så vi får rettet problemet.
                </BodyShort>
                <LegeOgBehandlerTelefonen short />
            </Alert>
            <Detail>Teknisk regelnavn</Detail>
            <BodyShort spacing className="italic">
                {outcome.rule}
            </BodyShort>
            Dersom du velger å sende inn sykmeldingen vil brukeren kunne se den på{' '}
            <Link href="https://www.nav.no/syk/sykefravaer" target="_blank">
                Ditt Sykefravær
            </Link>{' '}
            på nav.no, men den vil være markert som{' '}
            {outcome.status === 'INVALID' ? 'avvist' : 'under manuell behandling'}.
        </>
    )
}
