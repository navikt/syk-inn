import { PdlPerson } from '@core/services/pdl/pdl-api-schema'

export function createPdlPersonMock(ident?: string): PdlPerson {
    return {
        navn: {
            fornavn: 'Ola',
            mellomnavn: 'Nordmann',
            etternavn: 'Hansen',
        },
        foedselsdato: '1980-01-01',
        identer: [
            {
                ident: ident ?? '12345678901',
                historisk: false,
                gruppe: 'FOLKEREGISTERIDENT',
            },
        ],
    }
}
