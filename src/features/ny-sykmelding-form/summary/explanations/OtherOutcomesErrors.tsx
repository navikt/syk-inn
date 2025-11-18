import React, { ReactElement } from 'react'
import { Alert, BodyShort, Heading } from '@navikt/ds-react'

import { OtherSubmitOutcomesEnum } from '@queries'

export function OtherOutcomesAlert({
    cause,
    ident,
    navn,
}: { cause: OtherSubmitOutcomesEnum } & PatientDoesNotExistAlertProps): ReactElement {
    switch (cause) {
        case 'MISSING_PRACTITIONER_INFO':
            return <MissingPractitionerInfo />
        case 'PATIENT_NOT_FOUND_IN_PDL':
            return <PatientDoesNotExistAlert navn={navn} ident={ident} />
    }
}

type PatientDoesNotExistAlertProps = {
    navn: string | undefined
    ident: string | undefined
}

function PatientDoesNotExistAlert({ navn, ident }: PatientDoesNotExistAlertProps): ReactElement {
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

function MissingPractitionerInfo(): ReactElement {
    return (
        <Alert variant="warning">
            <Heading size="small" level="3" spacing>
                Vi mangler mer informasjon om deg
            </Heading>
            <BodyShort spacing>
                For å kunne sende inn en sykmelding må du registrere organisasjonsnummer og telefonnummer.
            </BodyShort>
        </Alert>
    )
}
