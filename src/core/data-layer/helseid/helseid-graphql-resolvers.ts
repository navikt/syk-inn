import { Resolvers } from '@resolvers'
import { createSchema } from '@data-layer/graphql/create-schema'
import { commonQueryResolvers, typeResolvers } from '@data-layer/graphql/common-resolvers'
import { raise } from '@lib/ts'
import { getHelseIdBehandler } from '@data-layer/helseid/helseid-service'

const helseidResolvers: Resolvers = {
    Query: {
        behandler: async () => {
            const behandler = await getHelseIdBehandler()

            return {
                hpr: behandler.hpr ?? raise('No HPR number in HelseID userinfo'),
                navn: behandler.navn,
                legekontorTlf: 'TODO',
                orgnummer: 'TODO',
            }
        },
        konsultasjon: () => null,
        pasient: () => null,
        sykmelding: () => null,
        sykmeldinger: () => null,
        draft: () => null,
        drafts: () => null,
        person: () => null,
        ...commonQueryResolvers,
    },
    Mutation: {
        saveDraft: () => raise('Not Implemented'),
        deleteDraft: () => raise('Not Implemented'),
        opprettSykmelding: () => raise('Not Implemented'),
        synchronizeSykmelding: () => raise('Not Implemented'),
    },
    ...typeResolvers,
}

export const helseIdSchema = createSchema(helseidResolvers)
