import React, { ReactElement } from 'react'
import { BodyShort, Heading } from '@navikt/ds-react'

function PagaendeSykmeldingerCard(): ReactElement {
    return (
        <div className="rounded-sm p-4 bg-bg-default">
            <Heading size="medium" level="2" spacing>
                Pågående sykmeldinger (0)
            </Heading>
            <BodyShort>Det er ingen aktive sykmeldinger i denne perioden.</BodyShort>
        </div>
    )
}

export default PagaendeSykmeldingerCard
