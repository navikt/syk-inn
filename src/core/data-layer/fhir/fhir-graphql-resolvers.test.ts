import { MockReadyClient } from '@navikt/smart-on-fhir/test'
import { execute } from 'graphql/execution'
import { describe, expect, test } from 'vitest'

import { PasientDocument } from '#queries'

import { FhirGraphqlContext } from './fhir-graphql-context'
import { fhirSchema } from './fhir-graphql-resolvers'
import { OID_FNR } from './resources/mappers/oids'

describe('fhirSchema', () => {
    test('resolves the patient using the supplied context', async () => {
        const client = new MockReadyClient({
            userId: 'practitioner-1',
            patientId: 'patient-1',
            encounterId: 'encounter-1',
        })

        client
            .on('Patient')
            .get('patient-1')
            .reply({
                resourceType: 'Patient',
                id: 'patient-1',
                name: [{ family: 'Doe', given: ['Jane'] }],
                identifier: [{ system: `urn:oid:${OID_FNR}`, value: '01010112345' }],
            })

        const contextValue = {
            client,
            behandler: { navn: 'John Doe', hpr: '123456', epost: null },
            patientIdent: '01010112345',
        } satisfies FhirGraphqlContext

        const result = await execute({
            schema: fhirSchema,
            document: PasientDocument,
            contextValue,
        })

        expect(result.data).toEqual({
            pasient: {
                navn: 'Jane Doe',
                ident: '01010112345',
                utdypendeSporsmal: null,
            },
        })

        client.assertAllUsed()
    })
})
