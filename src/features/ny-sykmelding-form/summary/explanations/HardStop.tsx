import React, { ReactElement, useEffect } from 'react'
import { logger } from '@navikt/next-logger'
import { Alert, BodyShort, Heading } from '@navikt/ds-react'
import { InformationSquareIcon } from '@navikt/aksel-icons'

import { RuleOutcomeFragment } from '@queries'
import LegeOgBehandlerTelefonen from '@components/help/LegeOgBehandlerTelefonen'
import { getRuleText } from '@features/ny-sykmelding-form/summary/rules/rule-texts'

type Props = {
    outcome: RuleOutcomeFragment
}

export function HardStop({ outcome }: Props): ReactElement {
    useEffect(() => {
        logger.error(`User got unexpected rule outcome when submitting, was ${outcome.rule}`)
    }, [outcome.rule])

    const ruleText = getRuleText(outcome.rule)

    return (
        <>
            <Alert variant="warning" className="mb-2">
                <Heading size="small" level="3" spacing>
                    Sykmelding kan ikke sendes inn
                </Heading>
                <BodyShort spacing>
                    Sykmeldingen du forsøker å sende inn har en feil eller mangel som gjør at Nav ikke kan motta den.
                </BodyShort>
                <Heading size="xsmall" level="4" className="flex items-center gap-1">
                    <InformationSquareIcon aria-hidden className="-mt-0.5" />
                    Forklaring
                </Heading>
                <BodyShort spacing className="italic">
                    {ruleText ?? `Ukjent årsak, teknisk navn: ${outcome.rule}`}
                </BodyShort>
                <BodyShort spacing>
                    Dersom du mener at dette er en feil og at sykmeldingen skal kunne sendes inn, ønsker vi at du tar
                    kontakt med oss.
                </BodyShort>
                <LegeOgBehandlerTelefonen short />
            </Alert>
        </>
    )
}
