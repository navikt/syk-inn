import { ReactElement } from 'react'
import { BodyShort, Table } from '@navikt/ds-react'

import { useContextBehandler } from '@components/ny-sykmelding-form/data-provider/hooks/use-context-behandler'

export function PractitionerSection(): ReactElement {
    const behandler = useContextBehandler()

    return (
        <div className="mt-2">
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
        </div>
    )
}
