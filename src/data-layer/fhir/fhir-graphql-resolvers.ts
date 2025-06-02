import { GraphQLError } from 'graphql/error'
import * as R from 'remeda'
import { logger } from '@navikt/next-logger'

import { QueriedPerson, Resolvers, Sykmelding } from '@resolvers'
import { DiagnoseFragment } from '@queries'
import { createSchema } from '@graphql/create-schema'
import { raise } from '@utils/ts'
import { getNameFromFhir, getValidPatientIdent } from '@fhir/mappers/patient'
import { diagnosisUrnToOidType, getDiagnosis } from '@fhir/mappers/diagnosis'
import { getServerEnv, isE2E, isLocalOrDemo } from '@utils/env'
import { pdlApiService } from '@services/pdl/PdlApiService'
import { getFnrIdent, getNameFromPdl } from '@services/pdl/PdlApiUtils'
import { wait } from '@utils/wait'
import { getHpr, practitionerToBehandler } from '@fhir/mappers/practitioner'
import { sykInnApiService } from '@services/syk-inn-api/SykInnApiService'
import { createDocumentReference, getPractitioner } from '@fhir/fhir-service'
import { diagnoseSystemToOid } from '@utils/oid'
import { ReadyClient } from '@navikt/smart-on-fhir/client'

import { searchDiagnose } from '../common/diagnose-search'

import { getReadyClient } from './smart/smart-client'

export const fhirResolvers: Resolvers<{ readyClient?: ReadyClient }> = {
    Query: {
        behandler: async (_, __, context) => {
            const client = context.readyClient ?? (await getReadyClient({ validate: true }))
            if ('error' in client) {
                throw new GraphQLError('AUTH_ERROR')
            }

            const practitioner = await client.request(`/${client.fhirUser}`)
            if ('error' in practitioner) {
                throw new GraphQLError('PARSING_ERROR')
            }

            return practitionerToBehandler(practitioner)
        },
        pasient: async (_, __, context) => {
            const client = context.readyClient ?? (await getReadyClient({ validate: true }))
            if ('error' in client) {
                throw new GraphQLError('AUTH_ERROR')
            }

            const patientInContext = await client.request(`/Patient/${client.patient}`)
            if ('error' in patientInContext) {
                throw new GraphQLError('PARSING_ERROR')
            }

            await wait(700)

            return {
                navn: getNameFromFhir(patientInContext.name),
                ident: getValidPatientIdent(patientInContext) ?? raise('Patient without valid FNR/DNR'),
            }
        },
        konsultasjon: async (_, __, context) => {
            const client = context.readyClient ?? (await getReadyClient({ validate: true }))
            if ('error' in client) {
                throw new GraphQLError('AUTH_ERROR')
            }

            const conditionsByEncounter = await client.request(`/Condition?encounter=${client.encounter}`)
            if ('error' in conditionsByEncounter) {
                throw new GraphQLError('PARSING_ERROR')
            }

            const conditionList = conditionsByEncounter.entry.map((it) => it.resource)
            const [relevanteDignoser, irrelevanteDiagnoser] = conditionList
                ? R.partition(conditionList, (diagnosis) =>
                      diagnosis.code.coding.some((coding) => diagnosisUrnToOidType(coding.system) != null),
                  )
                : [[], []]

            logger.info(
                `Fant ${relevanteDignoser.length} med gyldig ICPC-2 eller ICD-10 kode, ${irrelevanteDiagnoser.length} uten gyldig kode`,
            )

            return {
                diagnoser: R.pipe(
                    relevanteDignoser,
                    R.map((diagnosis) => getDiagnosis(diagnosis.code.coding)),
                    R.filter(R.isTruthy),
                    R.map(
                        (it) =>
                            ({
                                system: it.system,
                                code: it.code,
                                text: it.display,
                            }) satisfies DiagnoseFragment,
                    ),
                ),
            }
        },
        sykmelding: async (_, { id: sykmeldingId }, context) => {
            const client = context.readyClient ?? (await getReadyClient({ validate: true }))
            if ('error' in client) {
                throw new GraphQLError('AUTH_ERROR')
            }

            const practitioner = await client.request(`/${client.fhirUser}`)
            if ('error' in practitioner) {
                throw new GraphQLError('PARSING_ERROR')
            }

            const hpr = getHpr(practitioner.identifier)
            if (hpr == null) {
                logger.error('Missing HPR identifier in practitioner resource')
                throw new GraphQLError('PARSING_ERROR')
            }

            if ((isLocalOrDemo || isE2E) && !getServerEnv().useLocalSykInnApi) {
                logger.info('Running in local or demo environment, returning mocked sykmelding data')
                return {
                    sykmeldingId: 'ba78036d-b63c-4c5a-b3d5-b1d1f812da8d',
                    pasient: {
                        navn: 'Ola Nordmann',
                        ident: '12345678910',
                    },
                    aktivitet: {
                        type: 'AKTIVITET_IKKE_MULIG',
                        fom: '2024-02-15',
                        tom: '2024-02-18',
                    },
                    diagnose: {
                        hoved: {
                            system: 'ICD10',
                            code: 'L73',
                            // text: 'Brudd legg/ankel',
                        },
                        bi: [],
                    },
                    documentStatus: 'COMPLETE',
                } satisfies Sykmelding
            }

            const sykmelding = await sykInnApiService.getSykmelding(sykmeldingId, hpr)
            if ('errorType' in sykmelding) {
                throw new GraphQLError('API_ERROR')
            }

            const existingDocumentReference = await client.request(`/DocumentReference/${sykmeldingId}` as const)

            return {
                sykmeldingId: sykmelding.sykmeldingId,
                aktivitet: sykmelding.sykmelding.aktivitet,
                diagnose: {
                    hoved: {
                        system:
                            diagnosisUrnToOidType(sykmelding.sykmelding.hoveddiagnose.system) ??
                            raise(`Unknown diagnosis system ${sykmelding.sykmelding.hoveddiagnose.system}`),
                        code: sykmelding.sykmelding.hoveddiagnose.code,
                        // text: sykmelding.sykmelding.hoveddiagnose.text,
                    },
                    bi: [],
                },
                pasient: {
                    navn: 'TODO',
                    ident: sykmelding.pasientFnr,
                },
                documentStatus: 'resourceType' in existingDocumentReference ? 'COMPLETE' : 'PENDING',
            } satisfies Sykmelding
        },
        person: async (_, { ident }, context) => {
            const client = context.readyClient ?? (await getReadyClient({ validate: true }))
            if ('error' in client) {
                throw new GraphQLError('AUTH_ERROR')
            }

            if (!ident) {
                throw new GraphQLError('MISSING_IDENT')
            }

            if ((isLocalOrDemo || isE2E) && !getServerEnv().useLocalSykInnApi) {
                logger.info('Running in local or demo environment, returning mocked person data')
                // Fake dev loading
                await wait(2500, 500)

                return {
                    navn: 'Ola Nordmann',
                    ident: '12345678910',
                } satisfies QueriedPerson
            }

            const person = await pdlApiService.getPdlPerson(ident)
            if ('errorType' in person) {
                throw new GraphQLError('API_ERROR')
            }

            return {
                ident: getFnrIdent(person.identer) ?? raise('Person without valid FNR/DNR, hows that possible?'),
                navn: getNameFromPdl(person.navn),
            } satisfies QueriedPerson
        },
        diagnose: (_, { query }) => searchDiagnose(query),
    },
    Mutation: {
        opprettSykmelding: async (_, { nySykmelding }, context) => {
            const client = context.readyClient ?? (await getReadyClient({ validate: true }))
            if ('error' in client) {
                throw new GraphQLError('AUTH_ERROR')
            }

            const practitioner = await getPractitioner(client)
            if ('error' in practitioner) {
                throw new GraphQLError('PARSING_ERROR')
            }

            const hpr = getHpr(practitioner.identifier)
            if (hpr == null) {
                logger.error('Missing HPR identifier in practitioner resource')
                throw new GraphQLError('PARSING_ERROR')
            }

            if ((isLocalOrDemo || isE2E) && !getServerEnv().useLocalSykInnApi) {
                logger.warn(
                    `Is in demo, local or e2e, submitting send sykmelding values ${JSON.stringify(nySykmelding, null, 2)}`,
                )

                await wait(500)

                return { sykmeldingId: 'ba78036d-b63c-4c5a-b3d5-b1d1f812da8d' }
            }

            const result = await sykInnApiService.createNewSykmelding({
                pasientFnr: nySykmelding.pasientIdent,
                sykmelderHpr: hpr,
                sykmelding: {
                    hoveddiagnose: {
                        system: diagnoseSystemToOid(nySykmelding.hoveddiagnose.system),
                        code: nySykmelding.hoveddiagnose.code,
                    },
                    aktivitet: nySykmelding.perioder.map((periode) => {
                        // Use zod for this mapping
                        switch (periode.type) {
                            case 'AKTIVITET_IKKE_MULIG': {
                                return {
                                    type: 'AKTIVITET_IKKE_MULIG' as const,
                                    fom: periode.fom,
                                    tom: periode.tom,
                                }
                            }
                            case 'GRADERT': {
                                return {
                                    type: 'GRADERT' as const,
                                    grad: +(periode.grad ?? raise('Grad is required for GRADERT activity')),
                                    fom: periode.fom,
                                    tom: periode.tom,
                                }
                            }
                            case 'AVVENTENDE': {
                                return {
                                    type: 'AVVENTENDE' as const,
                                    fom: periode.fom,
                                    tom: periode.tom,
                                    innspillTilArbeidsgiver: periode.innspillTilArbeidsgiver ?? '',
                                }
                            }
                            case 'BEHANDLINGSDAGER': {
                                return {
                                    type: 'BEHANDLINGSDAGER' as const,
                                    fom: periode.fom,
                                    tom: periode.tom,
                                    antallBehandlingsdager: periode.antallBehandlingsdager ?? 0,
                                }
                            }
                            case 'REISETILSKUDD':
                                return {
                                    type: 'REISETILSKUDD' as const,
                                    fom: periode.fom,
                                    tom: periode.tom,
                                }
                            default:
                                raise(`Unknown activity type ${periode.type}`)
                        }
                        // TODO Should be list
                    })[0],
                },
                legekontorOrgnr: '999944614', // TODO: Should be retrieved from context/session
            })

            if ('errorType' in result) {
                throw new GraphQLError('API_ERROR')
            }

            return { sykmeldingId: result.sykmeldingId }
        },
        synchronizeSykmelding: async (_, { id: sykmeldingId }, context) => {
            const client = context.readyClient ?? (await getReadyClient({ validate: true }))
            if ('error' in client) {
                throw new GraphQLError('AUTH_ERROR')
            }

            const existingDocument = await client.request(`/DocumentReference/${sykmeldingId}`)
            if ('resourceType' in existingDocument) {
                return {
                    navStatus: 'COMPLETE',
                    documentStatus: 'COMPLETE',
                }
            }

            if ('error' in existingDocument && existingDocument.error === 'REQUEST_FAILED_RESOURCE_NOT_FOUND') {
                const createResult = await createDocumentReference(client, sykmeldingId)
                if ('error' in createResult) {
                    throw new GraphQLError('API_ERROR')
                }

                return {
                    navStatus: 'COMPLETE',
                    documentStatus: 'COMPLETE',
                }
            }

            throw new GraphQLError('API_ERROR')
        },
    },
}

export const fhirSchema = createSchema(fhirResolvers)
