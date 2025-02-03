import { PasientInfo } from '../../../data-fetcher/data-service'

export function oidTypeToReadableText(type: NonNullable<PasientInfo['oid']>['type']): string {
    switch (type) {
        case 'fnr':
            return 'fødselsnummer'
        case 'dnr':
            return 'd-nummer'
        default:
            return 'ukjent nummer'
    }
}
