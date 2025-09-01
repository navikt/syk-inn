import { GraphQLError } from 'graphql/error'
import { logger } from '@navikt/next-logger'
import * as R from 'remeda'
import { teamLogger } from '@navikt/next-logger/team-log'

import { Behandler, OpprettSykmeldingRuleOutcome, QueriedPerson, Resolvers } from '@resolvers'
import { createSchema } from '@data-layer/graphql/create-schema'
import { getNameFromFhir, getValidPatientIdent } from '@data-layer/fhir/mappers/patient'
import { fhirDiagnosisToRelevantDiagnosis } from '@data-layer/fhir/mappers/diagnosis'
import { getHpr, practitionerToBehandler } from '@data-layer/fhir/mappers/practitioner'
import { createDocumentReference, getAllSykmeldingMetaFromFhir } from '@data-layer/fhir/fhir-service'
import {
    getOrganisasjonsnummerFromFhir,
    getOrganisasjonstelefonnummerFromFhir,
} from '@data-layer/fhir/mappers/organization'
import { commonQueryResolvers, typeResolvers } from '@data-layer/graphql/common-resolvers'
import { pdlApiService } from '@core/services/pdl/pdl-api-service'
import { sykInnApiService } from '@core/services/syk-inn-api/syk-inn-api-service'
import { getFnrIdent, getNameFromPdl } from '@core/services/pdl/pdl-api-utils'
import {
    resolverInputToSykInnApiPayload,
    sykInnApiSykmeldingRedactedToResolverSykmelding,
    sykInnApiSykmeldingToResolverSykmelding,
} from '@core/services/syk-inn-api/syk-inn-api-utils'
import { OpprettSykmeldingMeta } from '@core/services/syk-inn-api/schema/opprett'
import { getFlag, getUserlessToggles, getUserToggles } from '@core/toggles/unleash'
import { aaregService } from '@core/services/aareg/aareg-service'
import { raise } from '@lib/ts'
import { getReadyClientForResolvers } from '@data-layer/fhir/smart/ready-client'
import { assertIsPilotUser } from '@data-layer/fhir/fhir-graphql-utils'

import { getDraftClient } from '../draft/draft-client'
import { DraftValuesSchema } from '../draft/draft-schema'

const fhirResolvers: Resolvers = {
    Query: {
        behandler: async () => {
            const [client, practitioner] = await getReadyClientForResolvers({ withPractitioner: true })

            const encounter = await client.encounter.request()
            if ('error' in encounter) {
                throw new GraphQLError('API_ERROR')
            }

            const organization = await client.request(encounter.serviceProvider.reference as `Organization/${string}`)
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

            return {
                ...practitionerToBehandler(practitioner),
                orgnummer,
                legekontorTlf,
            } satisfies Behandler
        },
        pasient: async () => {
            const [client] = await getReadyClientForResolvers()

            const patient = await client.patient.request()
            if ('error' in patient) {
                throw new GraphQLError('PARSING_ERROR')
            }

            return {
                navn: getNameFromFhir(patient.name),
                ident: getValidPatientIdent(patient.identifier) ?? raise('Patient without valid FNR/DNR'),
            }
        },
        konsultasjon: async () => {
            const [client] = await getReadyClientForResolvers()

            const conditionsByEncounter = await client.request(`Condition?encounter=${client.encounter.id}`)
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
                teamLogger.error(`Practitioner without HPR: ${JSON.stringify(practitioner, null, 2)}`)
                throw new GraphQLError('PARSING_ERROR')
            }

            const sykmelding = await sykInnApiService.getSykmelding(sykmeldingId, hpr)
            if ('errorType' in sykmelding) {
                throw new GraphQLError('API_ERROR')
            }

            if (sykmelding.kind === 'redacted') {
                const showRedactedFlag = getFlag('SYK_INN_SHOW_REDACTED', await getUserToggles(hpr))
                if (!showRedactedFlag) return null

                return sykInnApiSykmeldingRedactedToResolverSykmelding(sykmelding)
            }

            const existingDocumentReference = await client.request(`DocumentReference/${sykmeldingId}` as const, {
                expectNotFound: true,
            })

            return sykInnApiSykmeldingToResolverSykmelding(
                sykmelding,
                'resourceType' in existingDocumentReference ? 'COMPLETE' : 'PENDING',
            )
        },
        sykmeldinger: async () => {
            const [client, practitioner] = await getReadyClientForResolvers({ withPractitioner: true })

            const hpr = getHpr(practitioner.identifier)
            if (hpr == null) {
                logger.error('Missing HPR identifier in practitioner resource')
                teamLogger.error(`Practitioner without HPR: ${JSON.stringify(practitioner, null, 2)}`)
                throw new GraphQLError('PARSING_ERROR')
            }
            const patientInContext = await client.patient.request()
            if ('error' in patientInContext) {
                throw new GraphQLError('PARSING_ERROR')
            }

            const ident = getValidPatientIdent(patientInContext.identifier)
            if (ident == null) {
                logger.error('Missing valid FNR/DNR in patient resource')
                teamLogger.error(`Patient without valid FNR/DNR: ${JSON.stringify(patientInContext, null, 2)}`)
                throw new GraphQLError('API_ERROR')
            }

            const sykInnSykmeldinger = await sykInnApiService.getSykmeldinger(ident, hpr)
            if ('errorType' in sykInnSykmeldinger) {
                throw new GraphQLError('API_ERROR')
            }

            /**
             * Only return kind='redacted' sykmeldinger if SYK_INN_SHOW_REDACTED is enabled for this user
             */
            const showRedactedFlag = getFlag('SYK_INN_SHOW_REDACTED', await getUserToggles(hpr))
            const sykmeldinger = showRedactedFlag
                ? sykInnSykmeldinger
                : sykInnSykmeldinger.filter((it) => it.kind !== 'redacted')

            return sykmeldinger.map((it) => {
                return it.kind === 'redacted'
                    ? sykInnApiSykmeldingRedactedToResolverSykmelding(it)
                    : sykInnApiSykmeldingToResolverSykmelding(it)
            })
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
        draft: async (_, { draftId }) => {
            const [client, practitioner] = await getReadyClientForResolvers({ withPractitioner: true })
            const draftClient = await getDraftClient()

            const hpr = getHpr(practitioner.identifier)
            if (hpr == null) {
                logger.error('Missing HPR identifier in practitioner resource')
                teamLogger.error(`Practitioner without HPR: ${JSON.stringify(practitioner, null, 2)}`)
                throw new GraphQLError('PARSING_ERROR')
            }

            const pasient = await client.patient.request()
            if ('error' in pasient) {
                throw new GraphQLError('API_ERROR')
            }

            const ident = getValidPatientIdent(pasient.identifier)
            if (ident == null) {
                logger.error('Missing valid FNR/DNR in patient resource')
                teamLogger.error(`Patient without valid FNR/DNR: ${JSON.stringify(pasient, null, 2)}`)
                throw new GraphQLError('API_ERROR')
            }

            const draft = await draftClient.getDraft(draftId, { hpr, ident })

            if (draft == null) return null

            return {
                draftId,
                values: draft.values,
                lastUpdated: draft.lastUpdated,
            }
        },
        drafts: async () => {
            const [client, practitioner] = await getReadyClientForResolvers({ withPractitioner: true })

            const hpr = getHpr(practitioner.identifier)
            if (hpr == null) {
                logger.error('Missing HPR identifier in practitioner resource')
                teamLogger.error(`Practitioner without HPR: ${JSON.stringify(practitioner, null, 2)}`)
                throw new GraphQLError('PARSING_ERROR')
            }

            const pasient = await client.patient.request()
            if ('error' in pasient) {
                throw new GraphQLError('API_ERROR')
            }

            const ident = getValidPatientIdent(pasient.identifier)
            if (ident == null) {
                logger.error('Missing valid FNR/DNR in patient resource')
                teamLogger.error(`Patient without valid FNR/DNR: ${JSON.stringify(pasient, null, 2)}`)
                throw new GraphQLError('API_ERROR')
            }

            const draftClient = await getDraftClient()

            const allDrafts = await draftClient.getDrafts({ hpr, ident })

            return R.sortBy(allDrafts, [(it) => it.lastUpdated, 'desc'])
        },
        ...commonQueryResolvers,
    },
    Mutation: {
        saveDraft: async (_, { draftId, values }) => {
            const [client, practitioner] = await getReadyClientForResolvers({ withPractitioner: true })

            const hpr = getHpr(practitioner.identifier)
            if (hpr == null) {
                logger.error('Missing HPR identifier in practitioner resource')
                teamLogger.error(`Practitioner without HPR: ${JSON.stringify(practitioner, null, 2)}`)
                throw new GraphQLError('PARSING_ERROR')
            }

            const pasient = await client.patient.request()
            if ('error' in pasient) {
                throw new GraphQLError('API_ERROR')
            }

            const ident = getValidPatientIdent(pasient.identifier)
            if (ident == null) {
                logger.error('Missing valid FNR/DNR in patient resource')
                teamLogger.error(`Patient without valid FNR/DNR: ${JSON.stringify(pasient, null, 2)}`)
                throw new GraphQLError('API_ERROR')
            }

            const parsedValues = DraftValuesSchema.safeParse(values)
            if (!parsedValues.success) {
                logger.error(
                    new Error('Parsed values are not valid according to DraftValuesSchema', {
                        cause: parsedValues.error,
                    }),
                )
                throw new GraphQLError('API_ERROR')
            }

            const draftClient = await getDraftClient()
            await draftClient.saveDraft(draftId, { hpr, ident }, parsedValues.data)

            logger.info(`Saved draft ${draftId} to draft client`)

            return {
                draftId,
                values,
                lastUpdated: new Date().toISOString(),
            }
        },
        deleteDraft: async (_, { draftId }) => {
            const [client, practitioner] = await getReadyClientForResolvers({ withPractitioner: true })

            const hpr = getHpr(practitioner.identifier)
            if (hpr == null) {
                logger.error('Missing HPR identifier in practitioner resource')
                teamLogger.error(`Practitioner without HPR: ${JSON.stringify(practitioner, null, 2)}`)
                throw new GraphQLError('PARSING_ERROR')
            }

            const pasient = await client.patient.request()
            if ('error' in pasient) {
                throw new GraphQLError('API_ERROR')
            }

            const ident = getValidPatientIdent(pasient.identifier)
            if (ident == null) {
                logger.error('Missing valid FNR/DNR in patient resource')
                teamLogger.error(`Patient without valid FNR/DNR: ${JSON.stringify(pasient, null, 2)}`)
                throw new GraphQLError('API_ERROR')
            }

            const draftClient = await getDraftClient()
            await draftClient.deleteDraft(draftId, { hpr, ident })

            logger.info(`Deleted draft ${draftId} from draft client`)

            return true
        },
        opprettSykmelding: async (_, { draftId, values }) => {
            const [client] = await getReadyClientForResolvers()
            const { sykmelderHpr, pasientIdent, legekontorOrgnr, legekontorTlf } =
                await getAllSykmeldingMetaFromFhir(client)

            await assertIsPilotUser(sykmelderHpr)

            const meta: OpprettSykmeldingMeta = { sykmelderHpr, pasientIdent, legekontorOrgnr, legekontorTlf }
            const payload = resolverInputToSykInnApiPayload(values, meta)
            const result = await sykInnApiService.opprettSykmelding(payload)

            if ('errorType' in result) {
                throw new GraphQLError('API_ERROR')
            }

            if ('rule' in result) {
                // We got a rule hit, don't delete the draft
                return {
                    __typename: 'OpprettSykmeldingRuleOutcome',
                    rule: result.rule,
                    status: result.status,
                    message: result.message,
                    tree: result.tree,
                } satisfies OpprettSykmeldingRuleOutcome
            }

            // Delete the draft after successful creation
            const draftClient = await getDraftClient()
            await draftClient.deleteDraft(draftId, { hpr: sykmelderHpr, ident: pasientIdent })

            return sykInnApiSykmeldingToResolverSykmelding(result, 'PENDING')
        },
        synchronizeSykmelding: async (_, { id: sykmeldingId }) => {
            const [client] = await getReadyClientForResolvers()

            const existingDocument = await client.request(`DocumentReference/${sykmeldingId}`, { expectNotFound: true })
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
    Pasient: {
        arbeidsforhold: async (parent) => {
            const aaregToggle = getFlag('SYK_INN_AAREG', await getUserlessToggles())
            if (!aaregToggle) {
                logger.error(
                    'SYK_INN_AAREG flag is not enabled, why are you calling this? Remember to feature toggle your frontend as well.',
                )
                return []
            }

            return await aaregService.getArbeidsforhold(parent.ident)
        },
        userExists: async (parent) => {
            const pdlPerson = await pdlApiService.getPdlPerson(parent.ident)

            if ('errorType' in pdlPerson && pdlPerson.errorType === 'PERSON_NOT_FOUND') return false
            if ('errorType' in pdlPerson) {
                teamLogger.info(`Unable to fetch person ${parent.ident} in PDL cache, PDL says: pdlPerson.errorType`)
                logger.error(`Unable to fetch person from PDL cache, PDL says: ${pdlPerson.errorType} (see team logs)`)
                throw new GraphQLError(`Kunne ikke sjekke om person finnes akkurat nå`)
            }

            return true
        },
    },
    ...typeResolvers,
}

export const fhirSchema = createSchema(fhirResolvers)
