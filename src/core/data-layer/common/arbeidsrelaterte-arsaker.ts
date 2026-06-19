import { ArbeidsrelatertArsakType } from '#queries'

export function arbeidsrelaterteArsakerToText(type: ArbeidsrelatertArsakType): string {
    switch (type) {
        case 'MANGLENDE_TILRETTELEGGING':
            return 'Tilrettelegging ikke mulig'
        case 'ANNET':
            return 'Annet'
    }
}
