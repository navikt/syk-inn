import { Resolvers } from '@resolvers'
import { createSchema } from '@data-layer/graphql/create-schema'
import { commonQueryResolvers, typeResolvers } from '@data-layer/graphql/common-resolvers'
import { raise } from '@lib/ts'
import { getHelseIdUserInfo } from '@data-layer/helseid/helseid-userinfo'

const helseidResolvers: Resolvers = {
    Query: {
        behandler: async () => {
            const userinfo = await getHelseIdUserInfo()
            if (userinfo == null) {
                return null
            }

            return {
                hpr: userinfo['helseid://claims/hpr/hpr_number'] ?? raise('No HPR number in HelseID userinfo'),
                navn: userinfo.name,
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
