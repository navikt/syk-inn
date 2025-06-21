import nock, { Scope } from 'nock'
import { FhirPractitioner } from '@navikt/fhir-zod'

export function mockPractitioner(id: string): Scope {
    return nock('http://fhir-server')
        .get(`/Practitioner/${id}`)
        .reply(200, {
            resourceType: 'Practitioner',
            name: [{ family: 'Doe', given: ['John'] }],
            identifier: [{ system: 'urn:oid:2.16.578.1.12.4.1.4.4', value: '9144889' }],
        } satisfies FhirPractitioner)
}
