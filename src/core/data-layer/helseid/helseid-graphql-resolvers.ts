import { Resolvers } from '@resolvers'
import { createSchema } from '@data-layer/graphql/create-schema'
import { commonQueryResolvers, typeResolvers } from '@data-layer/graphql/common-resolvers'
import { raise } from '@lib/ts'

const helseidResolvers: Resolvers = {
    Query: {
        konsultasjon: () => null,
        pasient: () => null,
        behandler: () => null,
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
