import { GraphQLError } from 'graphql/error'
import { logger } from '@navikt/next-logger'

import { ReadyClient } from '@navikt/smart-on-fhir/client'
import { QueriedPerson, Resolvers, Sykmelding } from '@resolvers'
import { createSchema } from '@graphql/create-schema'
import { getNameFromFhir, getValidPatientIdent } from '@fhir/mappers/patient'
import { diagnosisUrnToOidType, fhirDiagnosisToRelevantDiagnosis } from '@fhir/mappers/diagnosis'
import { raise } from '@utils/ts'
import { diagnoseSystemToOid } from '@utils/oid'
import { wait } from '@utils/wait'
import { pdlApiService } from '@services/pdl/pdl-api-service'
import { getFnrIdent, getNameFromPdl } from '@services/pdl/pdl-api-utils'
import { getHpr, practitionerToBehandler } from '@fhir/mappers/practitioner'
import { sykInnApiService } from '@services/syk-inn-api/syk-inn-api-service'
import { createDocumentReference } from '@fhir/fhir-service'
import { spanAsync } from '@otel/otel'
import { getOrganisasjonsnummerFromFhir, getOrganisasjonstelefonnummerFromFhir } from '@fhir/mappers/organization'

import { getDiagnoseText, searchDiagnose } from '../common/diagnose-search'
import { getDraftClient } from '../draft/draft-client'

import { getReadyClientForResolvers } from './smart/smart-client'

export const fhirResolvers: Resolvers<{ readyClient?: ReadyClient }> = {
    Query: {
        behandler: async () => {
            const [, practitioner] = await getReadyClientForResolvers({ withPractitioner: true })

            await wait(700)

            return practitionerToBehandler(practitioner)
        },
        pasient: async () => {
            const [client] = await getReadyClientForResolvers()

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
        konsultasjon: async () => {
            const [client] = await getReadyClientForResolvers()

            const conditionsByEncounter = await client.request(`/Condition?encounter=${client.encounter}`)
            if ('error' in conditionsByEncounter) {
                throw new GraphQLError('PARSING_ERROR')
            }

            if (conditionsByEncounter.entry == null) {
                return { diagnoser: [] }
            }

            const conditionList = conditionsByEncounter.entry.map((it) => it.resource)

            return { diagnoser: fhirDiagnosisToRelevantDiagnosis(conditionList) }
        },
        sykmelding: async (_, { id: sykmeldingId }) => {
            const [client, practitioner] = await getReadyClientForResolvers({ withPractitioner: true })

            const hpr = getHpr(practitioner.identifier)
            if (hpr == null) {
                logger.error('Missing HPR identifier in practitioner resource')
                throw new GraphQLError('PARSING_ERROR')
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
                        text: getDiagnoseText(
                            diagnosisUrnToOidType(sykmelding.sykmelding.hoveddiagnose.system) ??
                                raise('Unknown diagnosis system'),
                            sykmelding.sykmelding.hoveddiagnose.code,
                        ),
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
        person: async (_, { ident }) => {
            // Only validate session
            await getReadyClientForResolvers()

            if (!ident) throw new GraphQLError('MISSING_IDENT')

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
        draft: async (_, { draftId }) => {
            const draftClient = await getDraftClient()

            // TODO verify access to draft
            const draft = await draftClient.getDraft(draftId)

            if (draft == null) return null

            return {
                draftId,
                values: draft,
            }
        },
        drafts: async () => {
            const [client, practitioner] = await getReadyClientForResolvers({ withPractitioner: true })

            const hpr = getHpr(practitioner.identifier)
            if (hpr == null) {
                logger.error('Missing HPR identifier in practitioner resource')
                throw new GraphQLError('PARSING_ERROR')
            }

            const pasient = await client.request(`/Patient/${client.patient}`)
            if ('error' in pasient) {
                throw new GraphQLError('API_ERROR')
            }

            const ident = getValidPatientIdent(pasient)
            if (ident == null) {
                logger.error('Missing valid FNR/DNR in patient resource')
                throw new GraphQLError('API_ERROR')
            }

            const draftClient = await getDraftClient()

            const allDrafts = await draftClient.getDrafts({ hpr, ident })

            return allDrafts
        },
    },
    Mutation: {
        saveDraft: async (_, { draftId, values }) => {
            const [client, practitioner] = await getReadyClientForResolvers({ withPractitioner: true })

            const hpr = getHpr(practitioner.identifier)
            if (hpr == null) {
                logger.error('Missing HPR identifier in practitioner resource')
                throw new GraphQLError('PARSING_ERROR')
            }

            const pasient = await client.request(`/Patient/${client.patient}`)
            if ('error' in pasient) {
                throw new GraphQLError('API_ERROR')
            }

            const ident = getValidPatientIdent(pasient)
            if (ident == null) {
                logger.error('Missing valid FNR/DNR in patient resource')
                throw new GraphQLError('API_ERROR')
            }

            const draftClient = await getDraftClient()
            await draftClient.saveDraft(draftId, { hpr, ident }, values)

            logger.info(`Saved draft ${draftId} to draft client`)

            return {
                draftId,
                values,
            }
        },
        deleteDraft: async (_, { draftId }) => {
            const [client, practitioner] = await getReadyClientForResolvers({ withPractitioner: true })

            const hpr = getHpr(practitioner.identifier)
            if (hpr == null) {
                logger.error('Missing HPR identifier in practitioner resource')
                throw new GraphQLError('PARSING_ERROR')
            }

            const pasient = await client.request(`/Patient/${client.patient}`)
            if ('error' in pasient) {
                throw new GraphQLError('API_ERROR')
            }

            const ident = getValidPatientIdent(pasient)
            if (ident == null) {
                logger.error('Missing valid FNR/DNR in patient resource')
                throw new GraphQLError('API_ERROR')
            }

            const draftClient = await getDraftClient()

            // TODO verify access to draft
            await draftClient.deleteDraft(draftId, { hpr, ident })

            logger.info(`Deleted draft ${draftId} from draft client`)

            return true
        },
        opprettSykmelding: async (_, { nySykmelding }) => {
            const [client, practitioner] = await getReadyClientForResolvers({ withPractitioner: true })

            const hpr = getHpr(practitioner.identifier)
            if (hpr == null) {
                logger.error('Missing HPR identifier in practitioner resource')
                throw new GraphQLError('PARSING_ERROR')
            }

            // TODO: Fetching these patient, encounter and organization can probably be done a bit more effective
            const pasient = await client.request(`/Patient/${client.patient}`)
            if ('error' in pasient) {
                throw new GraphQLError('API_ERROR')
            }

            const encounter = await client.request(`/Encounter/${client.encounter}`)
            if ('error' in encounter) {
                throw new GraphQLError('API_ERROR')
            }

            const organization = await client.request(
                `/${encounter.serviceProvider.reference}` as `/Organization/${string}`,
            )
            if ('error' in organization) {
                throw new GraphQLError('API_ERROR')
            }

            const orgnummer = getOrganisasjonsnummerFromFhir(organization)
            if (orgnummer == null) {
                logger.error('Organization without valid orgnummer')
                throw new GraphQLError('API_ERROR')
            }

            const legekontorTlf = getOrganisasjonstelefonnummerFromFhir(organization)
            if (legekontorTlf == null) {
                logger.error('Organization without valid phone number')
                throw new GraphQLError('API_ERROR')
            }

            const pasientIdent = getValidPatientIdent(pasient)
            if (pasientIdent == null) {
                logger.error('Patient without valid FNR/DNR')
                throw new GraphQLError('API_ERROR')
            }

            const result = await sykInnApiService.createNewSykmelding({
                pasientFnr: pasientIdent,
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
                            default:
                                raise(`Unknown activity type ${periode.type}`)
                        }
                        // TODO Should be list
                    })[0],
                },
                legekontorOrgnr: orgnummer,
            })

            if ('errorType' in result) {
                throw new GraphQLError('API_ERROR')
            }

            return { sykmeldingId: result.sykmeldingId }
        },
        synchronizeSykmelding: async (_, { id: sykmeldingId }) => {
            const [client] = await getReadyClientForResolvers()

            const existingDocument = await spanAsync('get document reference', () =>
                client.request(`/DocumentReference/${sykmeldingId}`),
            )
            if ('resourceType' in existingDocument) {
                return {
                    navStatus: 'COMPLETE',
                    documentStatus: 'COMPLETE',
                }
            }

            if ('error' in existingDocument && existingDocument.error === 'REQUEST_FAILED_RESOURCE_NOT_FOUND') {
                const createResult = await spanAsync('create document reference', () =>
                    createDocumentReference(client, sykmeldingId),
                )
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
    Aktivitet: {
        __resolveType: (parent) => {
            switch (parent.type) {
                case 'AKTIVITET_IKKE_MULIG':
                    return 'AktivitetIkkeMulig'
                case 'AVVENTENDE':
                    return 'Avventende'
                case 'BEHANDLINGSDAGER':
                    return 'Behandlingsdager'
                case 'GRADERT':
                    return 'Gradert'
                case 'REISETILSKUDD':
                    return 'Reisetilskudd'
            }
        },
    },
}

export const fhirSchema = createSchema(fhirResolvers)
