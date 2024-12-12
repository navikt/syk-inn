import React, { ReactElement } from 'react'
import { List } from '@navikt/ds-react'
import { CheckmarkCircleFillIcon, CircleIcon } from '@navikt/aksel-icons'

import { useContextPasient } from '@components/ny-sykmelding-form/data-provider/hooks/use-context-pasient'
import { PasientInfo } from '@components/ny-sykmelding-form/data-provider/NySykmeldingFormDataService'
import { toReadableDatePeriod } from '@utils/date'
import { NonNullableObject } from '@utils/ts'

import { AktivitetFormValue, useFormContext } from '../../NySykmeldingFormValues'

function NySykmeldingFormSummary(): ReactElement {
    return (
        <List>
            <PasientListItem />
            <DiagnoseListItem />
            <AktivitetListItem />
        </List>
    )
}

function PasientListItem(): ReactElement | null {
    const { watch } = useFormContext()
    const pasient = watch('pasient')
    const pasientQuery = useContextPasient({
        allowContextless: true,
    })

    if (pasient?.length !== 11 && pasientQuery.data?.oid == null) {
        return (
            <List.Item
                icon={<CircleIcon aria-hidden className="text-text-subtle" />}
                title="Pasient"
                className="text-text-subtle"
            >
                Ikke valgt
            </List.Item>
        )
    }

    return (
        <List.Item icon={<CheckmarkCircleFillIcon aria-hidden className="text-icon-success" />} title="Pasient">
            {pasientQuery.data != null ? pasientInfoName(pasientQuery.data) : pasient}
        </List.Item>
    )
}

function DiagnoseListItem(): ReactElement | null {
    const { watch } = useFormContext()
    const hovedDiagnose = watch('diagnoser.hoved')

    if (hovedDiagnose == null) {
        return (
            <List.Item
                icon={<CircleIcon aria-hidden className="text-text-subtle" />}
                title="Hoveddiagnose"
                className="text-text-subtle"
            >
                Ikke valgt
            </List.Item>
        )
    }

    return (
        <List.Item icon={<CheckmarkCircleFillIcon aria-hidden className="text-icon-success" />} title="Hoveddiagnose">
            {hovedDiagnose.code} - {hovedDiagnose.text} ({hovedDiagnose.system})
        </List.Item>
    )
}

function AktivitetListItem(): ReactElement | null {
    const { watch } = useFormContext()
    const aktivitet = watch('aktivitet')

    if (!isCompleteAktivitet(aktivitet)) {
        return (
            <List.Item
                icon={<CircleIcon aria-hidden className="text-text-subtle" />}
                title="Aktivitet"
                className="text-text-subtle"
            >
                Ikke valgt
            </List.Item>
        )
    }

    return (
        <List.Item icon={<CheckmarkCircleFillIcon aria-hidden className="text-icon-success" />} title="Aktivitet">
            {aktivitetDescription(aktivitet)}
        </List.Item>
    )
}

function isCompleteAktivitet(aktivitet: AktivitetFormValue | null): aktivitet is NonNullableObject<AktivitetFormValue> {
    if (aktivitet == null || aktivitet.fom == null || aktivitet.tom == null) return false

    switch (aktivitet.type) {
        case 'GRADERT':
            return aktivitet.grad != null
        default:
            return true
    }
}

function aktivitetDescription(aktivitet: NonNullableObject<AktivitetFormValue>): string {
    switch (aktivitet.type) {
        case 'AKTIVITET_IKKE_MULIG':
            return `Aktivitet ikke mulig (100% sykmeldt) i perioden ${toReadableDatePeriod(aktivitet.fom, aktivitet.tom)}`
        case 'GRADERT':
            return `Redusert aktivitet (${aktivitet.grad}% sykmeldt) i perioden ${toReadableDatePeriod(aktivitet.fom, aktivitet.tom)}`
    }
}

function pasientInfoName(data: PasientInfo): string {
    return `${data.navn} ${data.oid ? `(${data.oid.nr})` : ''}`
}

export default NySykmeldingFormSummary
