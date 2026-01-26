import * as R from 'remeda'

import { PdlPerson } from '@core/services/pdl/pdl-api-schema'

export function getFnrIdent(identer: PdlPerson['identer']): string | null {
    return (
        R.pipe(
            identer,
            R.filter((it) => !it.historisk),
            R.find((it) => it.gruppe === 'FOLKEREGISTERIDENT'),
        )?.ident ?? null
    )
}

export function formatPdlName(navn: PdlPerson['navn']): string {
    return `${navn.fornavn}${navn.mellomnavn ? ` ${navn.mellomnavn}` : ''} ${navn.etternavn}`
}
