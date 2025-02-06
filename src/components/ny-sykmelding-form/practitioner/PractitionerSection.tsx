import React, { ReactElement } from 'react'
import { BodyShort, Detail, Table } from '@navikt/ds-react'

import { useDataService } from '../../../data-fetcher/data-provider'

const FASTLEGE_AUTORISASJONER_ENABLED = false

export function PractitionerSection(): ReactElement {
    const dataService = useDataService()
    const behandler = dataService.context.behandler

    return (
        <div className="mt-2">
            <Detail>Sykmelder</Detail>
            <BodyShort spacing>{behandler.navn}</BodyShort>
            <Detail>HPR-nummer</Detail>
            <BodyShort spacing>{behandler.hpr}</BodyShort>
            {FASTLEGE_AUTORISASJONER_ENABLED && (
                <>
                    <BodyShort spacing>Oversikt over deg som sykmelder sine autorisasjoner.</BodyShort>
                    {behandler.autorisasjoner.length === 0 && <BodyShort spacing>Fant ingen autorisasjoner.</BodyShort>}
                    {behandler.autorisasjoner.length > 0 && (
                        <Table size="small">
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell scope="col">Kategori</Table.HeaderCell>
                                    <Table.HeaderCell scope="col">Autorisasjonstype</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {behandler.autorisasjoner.map(({ autorisasjon, kategori }, i) => {
                                    return (
                                        <Table.Row key={i}>
                                            <Table.DataCell scope="row">
                                                {kategori.display} ({kategori.code})
                                            </Table.DataCell>
                                            {autorisasjon != null ? (
                                                <Table.DataCell>
                                                    {autorisasjon?.code} {autorisasjon?.display}
                                                </Table.DataCell>
                                            ) : (
                                                <Table.DataCell>-</Table.DataCell>
                                            )}
                                        </Table.Row>
                                    )
                                })}
                            </Table.Body>
                        </Table>
                    )}
                </>
            )}
        </div>
    )
}
