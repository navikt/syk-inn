import { MockReadyClient } from '@navikt/smart-on-fhir/test'
import { afterEach, describe, expect, test } from 'vitest'

import { ICD10_OID_VALUE, ICPC2_OID_VALUE } from '#data-layer/common/diagnose'

import { Behandler, BehandlerMeta } from './fhir-resource-types'
import { fhirResourcesService, isResourceError } from './fhir-resources-service'
import { OID_DNR, OID_FNR, OID_HPR } from './mappers/oids'

describe('FHIR Resources Service', () => {
    const launchedIds = {
        patient: 'pati-ent-foo',
        encounter: 'enco-baz-baz',
        practitioner: 'prac-foo-bar',
        organization: 'org-foo-bar',
    }

    const mockClient = new MockReadyClient({
        userId: launchedIds.practitioner,
        encounterId: launchedIds.encounter,
        patientId: launchedIds.patient,
    })

    afterEach(() => {
        mockClient.reset()
    })

    describe('getBehandler', () => {
        test('behandler with correct data should map correctly', async () => {
            mockClient
                .on('Practitioner')
                .get(launchedIds.practitioner)
                .reply({
                    resourceType: 'Practitioner',
                    id: launchedIds.practitioner,
                    name: [{ family: 'Doe', given: ['John'] }],
                    identifier: [{ system: `urn:oid:${OID_HPR}`, value: '123456' }],
                })

            const result = await fhirResourcesService.getBehandler(mockClient)

            expect(result).toEqual({
                navn: 'John Doe',
                hpr: '123456',
                epost: null,
            } satisfies Behandler)

            mockClient.assertAllUsed()
        })

        test('behandler without HPR should result in NO_HPR', async () => {
            mockClient
                .on('Practitioner')
                .get(launchedIds.practitioner)
                .reply({
                    resourceType: 'Practitioner',
                    id: launchedIds.practitioner,
                    name: [{ family: 'Doe', given: ['John'] }],
                    identifier: [],
                })

            const result = await fhirResourcesService.getBehandler(mockClient)
            expect(isResourceError(result)).toBe(true)
            expect(result).toEqual({ error: 'NO_HPR' })

            mockClient.assertAllUsed()
        })
    })

    describe('getPasient', () => {
        test('pasient with correct data should map correctly', async () => {
            mockClient
                .on('Patient')
                .get(launchedIds.patient)
                .reply({
                    resourceType: 'Patient',
                    id: launchedIds.patient,
                    name: [{ family: 'Doe', given: ['Jane'] }],
                    identifier: [
                        { system: `urn:oid:${OID_DNR}`, value: '12344411123' },
                        // FNR has implicit precedence over DNR
                        { system: `urn:oid:${OID_FNR}`, value: '01010112345' },
                    ],
                })

            const result = await fhirResourcesService.getPasient(mockClient)

            expect(result).toEqual({
                navn: 'Jane Doe',
                ident: '01010112345',
            })

            mockClient.assertAllUsed()
        })

        test('pasient with only DNR should also work', async () => {
            mockClient
                .on('Patient')
                .get(launchedIds.patient)
                .reply({
                    resourceType: 'Patient',
                    id: launchedIds.patient,
                    name: [{ family: 'Doe', given: ['Jane'] }],
                    identifier: [{ system: `urn:oid:${OID_DNR}`, value: '12344411123' }],
                })

            const result = await fhirResourcesService.getPasient(mockClient)

            expect(result).toEqual({
                navn: 'Jane Doe',
                ident: '12344411123',
            })

            mockClient.assertAllUsed()
        })

        test('pasient without valid ident (FNR/DNR) should result in NO_IDENT', async () => {
            mockClient
                .on('Patient')
                .get(launchedIds.patient)
                .reply({
                    resourceType: 'Patient',
                    id: launchedIds.patient,
                    name: [{ family: 'Doe', given: ['Jane'] }],
                    identifier: [{ system: `urn:oid:${OID_HPR}`, value: '123456' }],
                })

            const result = await fhirResourcesService.getPasient(mockClient)
            expect(isResourceError(result)).toBe(true)
            expect(result).toEqual({ error: 'NO_IDENT' })

            mockClient.assertAllUsed()
        })
    })

    describe('getExtendedBehandlerMeta', () => {
        test('organization details should map correctly via serviceProvider', async () => {
            mockClient
                .on('Encounter')
                .get(launchedIds.encounter)
                .reply({
                    resourceType: 'Encounter',
                    id: launchedIds.encounter,
                    status: 'in-progress',
                    serviceProvider: { reference: `Organization/${launchedIds.organization}` },
                })
            mockClient
                .on('Organization')
                .get(launchedIds.organization)
                .reply({
                    resourceType: 'Organization',
                    id: launchedIds.organization,
                    identifier: [{ system: 'urn:oid:2.16.578.1.12.4.1.4.101', value: '123456789' }],
                    telecom: [
                        { system: 'email', value: 'office@example.com' },
                        { system: 'phone', value: '12345678' },
                    ],
                })

            const result = await fhirResourcesService.getExtendedBehandlerMeta(mockClient)

            expect(result).toEqual({ orgnummer: '123456789', legekontorTlf: '12345678' } satisfies BehandlerMeta)
            mockClient.assertAllUsed()
        })

        test('organization without orgnummer should result in NO_ORGNUMMER', async () => {
            mockClient
                .on('Encounter')
                .get(launchedIds.encounter)
                .reply({
                    resourceType: 'Encounter',
                    id: launchedIds.encounter,
                    status: 'in-progress',
                    serviceProvider: { reference: `Organization/${launchedIds.organization}` },
                })
            mockClient
                .on('Organization')
                .get(launchedIds.organization)
                .reply({
                    resourceType: 'Organization',
                    id: launchedIds.organization,
                    identifier: [],
                    telecom: [{ system: 'phone', value: '12345678' }],
                })

            const result = await fhirResourcesService.getExtendedBehandlerMeta(mockClient)

            expect(isResourceError(result)).toBe(true)
            expect(result).toEqual({ error: 'NO_ORGNUMMER' })
            mockClient.assertAllUsed()
        })

        test('organization without phone should result in NO_PHONE', async () => {
            mockClient
                .on('Encounter')
                .get(launchedIds.encounter)
                .reply({
                    resourceType: 'Encounter',
                    id: launchedIds.encounter,
                    status: 'in-progress',
                    serviceProvider: { reference: `Organization/${launchedIds.organization}` },
                })
            mockClient
                .on('Organization')
                .get(launchedIds.organization)
                .reply({
                    resourceType: 'Organization',
                    id: launchedIds.organization,
                    identifier: [{ system: 'urn:oid:2.16.578.1.12.4.1.4.101', value: '123456789' }],
                    telecom: [{ system: 'email', value: 'office@example.com' }],
                })

            const result = await fhirResourcesService.getExtendedBehandlerMeta(mockClient)

            expect(isResourceError(result)).toBe(true)
            expect(result).toEqual({ error: 'NO_PHONE' })
            mockClient.assertAllUsed()
        })
    })

    describe('getDiagnosisInEncounter', () => {
        test('relevant diagnoses should map while unrelated codes are ignored', async () => {
            mockClient
                .on('Condition')
                .search(`encounter=${launchedIds.encounter}`)
                .reply({
                    resourceType: 'Bundle',
                    type: 'searchset',
                    entry: [
                        {
                            resource: {
                                resourceType: 'Condition',
                                id: 'condition-1',
                                subject: { reference: `Patient/${launchedIds.patient}` },
                                encounter: { reference: `Encounter/${launchedIds.encounter}` },
                                code: {
                                    coding: [
                                        { system: `urn:oid:${ICPC2_OID_VALUE}`, code: 'P74', display: 'Angstlidelse' },
                                    ],
                                },
                            },
                        },
                        {
                            resource: {
                                resourceType: 'Condition',
                                id: 'condition-2',
                                subject: { reference: `Patient/${launchedIds.patient}` },
                                encounter: { reference: `Encounter/${launchedIds.encounter}` },
                                code: {
                                    coding: [
                                        { system: `urn:oid:${ICD10_OID_VALUE}`, code: 'A051', display: 'Botulisme' },
                                    ],
                                },
                            },
                        },
                        {
                            resource: {
                                resourceType: 'Condition',
                                id: 'condition-3',
                                subject: { reference: `Patient/${launchedIds.patient}` },
                                encounter: { reference: `Encounter/${launchedIds.encounter}` },
                                code: {
                                    coding: [{ system: 'http://example.com/other', code: 'X1', display: 'Other' }],
                                },
                            },
                        },
                    ],
                })

            const result = await fhirResourcesService.getDiagnosisInEncounter(mockClient)

            expect(result).toEqual([
                { system: 'ICPC2', code: 'P74', text: 'Angstlidelse' },
                { system: 'ICD10', code: 'A051', text: 'Botulisme' },
            ])
            mockClient.assertAllUsed()
        })

        test('no conditions should return an empty list', async () => {
            mockClient.on('Condition').search(`encounter=${launchedIds.encounter}`).reply({
                resourceType: 'Bundle',
                type: 'searchset',
            })

            const result = await fhirResourcesService.getDiagnosisInEncounter(mockClient)

            expect(result).toEqual([])
            mockClient.assertAllUsed()
        })
    })
})
