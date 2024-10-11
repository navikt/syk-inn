import { ICD10, ICPC2 } from '@navikt/diagnosekoder'
import Fuse from 'fuse.js'

const icd10 = ICD10.map((it) => ({ system: 'ICD10', ...it }))
const icpc2 = ICPC2.map((it) => ({ system: 'ICPC2', ...it }))

const megaFuse = new Fuse([...icd10, ...icpc2], { keys: ['code', 'text', 'system'], threshold: 0.2 })

export function GET(request: Request): Response {
    const params = new URL(request.url).searchParams
    const value = params.get('value')
    if (value == null) {
        return Response.json({ reason: 'Missing required search value' }, { status: 400 })
    }

    const fuseResult = megaFuse
        .search(value)
        .map((it) => ({
            system: it.item.system,
            code: it.item.code,
            text: it.item.text,
        }))
        .slice(0, 100)

    return Response.json(fuseResult, { status: 200 })
}
