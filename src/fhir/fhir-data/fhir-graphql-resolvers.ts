import { GraphQLError } from 'graphql/error'

import { Resolvers } from '@resolvers'
import { createSchema } from '@graphql/type-defs'
import { getReadyClient } from '@fhir/smart-client'
import { getFastlege, getName, getValidPatientIdent } from '@fhir/fhir-data/mappers/patient'
import { raise } from '@utils/ts'

export const fhirResolvers: Resolvers = {
    Query: {
        pasient: async () => {
            const client = await getReadyClient({ validate: true })

            if ('error' in client) {
                throw new GraphQLError('Weee woooo weeeee wooo')
            }

            const patientResponse = await client.request(`/Patient/${client.patient}`)
            if ('error' in patientResponse) {
                throw new GraphQLError('Weee woooo weeeee wooo')
            }

            return {
                navn: getName(patientResponse.name),
                ident: getValidPatientIdent(patientResponse) ?? raise('Patient without valid FNR/DNR'),
                fastlege: getFastlege(patientResponse),
            }
        },
    },
}

export const fhirSchema = createSchema(fhirResolvers)
