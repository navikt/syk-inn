import React, { ReactElement } from 'react'
import { BodyShort } from '@navikt/ds-react'

import { OtherSubmitOutcomesEnum } from '@queries'
import { DetailedAlert, SimpleAlert } from '@components/help/GeneralErrors'

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
        <DetailedAlert
            level="warning"
            title={
                navn && ident
                    ? `Fant ikke ${navn} (${ident}) i folkeregisteret.`
                    : 'Kunne ikke bekrefte pasientens identitet.'
            }
        >
            <BodyShort spacing>
                Det ser ut som pasienten du prøver å sende inn sykmeldingen for ikke finnes i Navs systemer.
            </BodyShort>
        </DetailedAlert>
    )
}

function MissingPractitionerInfo(): ReactElement {
    return (
        <SimpleAlert level="warning" title="Vi mangler mer informasjon om deg">
            For å kunne sende inn en sykmelding må du registrere organisasjonsnummer og telefonnummer.
        </SimpleAlert>
    )
}
