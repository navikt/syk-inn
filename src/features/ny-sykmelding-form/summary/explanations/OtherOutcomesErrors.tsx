import React, { ReactElement } from 'react'
import { BodyShort, LocalAlert } from '@navikt/ds-react'

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
        <LocalAlert status="warning">
            <LocalAlert.Header>
                <LocalAlert.Title>
                    {navn && ident
                        ? `Fant ikke ${navn} (${ident}) i folkeregisteret.`
                        : 'Kunne ikke bekrefte pasientens identitet.'}
                </LocalAlert.Title>
            </LocalAlert.Header>
            <LocalAlert.Content>
                <BodyShort spacing>
                    Det ser ut som pasienten du prøver å sende inn sykmeldingen for ikke finnes i Navs systemer.
                </BodyShort>
                <BodyShort>Dersom du mener dette er en feil, vennligst kontakt lege- og behandlertelefon.</BodyShort>
            </LocalAlert.Content>
        </LocalAlert>
    )
}

function MissingPractitionerInfo(): ReactElement {
    return (
        <LocalAlert status="warning">
            <LocalAlert.Header>
                <LocalAlert.Title>Vi mangler mer informasjon om deg</LocalAlert.Title>
            </LocalAlert.Header>
            <LocalAlert.Content>
                For å kunne sende inn en sykmelding må du registrere organisasjonsnummer og telefonnummer.
            </LocalAlert.Content>
        </LocalAlert>
    )
}
