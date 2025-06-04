import { PdlPerson } from '@services/pdl/pdl-api-schema'

export function createPdlPersonMock(): PdlPerson {
    return {
        navn: {
            fornavn: 'Ola',
            mellomnavn: 'Nordmann',
            etternavn: 'Hansen',
        },
        foedselsdato: '1980-01-01',
        identer: [
            {
                ident: '12345678901',
                historisk: false,
                gruppe: 'FOLKEREGISTERIDENT',
            },
        ],
    }
}
