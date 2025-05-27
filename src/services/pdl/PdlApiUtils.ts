import * as R from 'remeda'

import { PdlPerson } from '@services/pdl/PdlApiSchema'

export function getFnrIdent(identer: PdlPerson['identer']): string | null {
    return (
        R.pipe(
            identer,
            R.filter((it) => !it.historisk),
            R.find((it) => it.gruppe === 'FOLKEREGISTERIDENT'),
        )?.ident ?? null
    )
}

export function getName(navn: PdlPerson['navn']): string {
    return `${navn.fornavn}${navn.mellomnavn ? ` ${navn.mellomnavn}` : ''} ${navn.etternavn}`
}
