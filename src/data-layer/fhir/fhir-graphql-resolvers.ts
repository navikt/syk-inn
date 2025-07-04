import { GraphQLError } from 'graphql/error'
import { logger } from '@navikt/next-logger'
import * as R from 'remeda'
import { teamLogger } from '@navikt/next-logger/team-log'
import { ReadyClient } from '@navikt/smart-on-fhir/client'

import { Behandler, OpprettSykmeldingRuleOutcome, QueriedPerson, Resolvers } from '@resolvers'
import { createSchema } from '@graphql/create-schema'
import { getNameFromFhir, getValidPatientIdent } from '@fhir/mappers/patient'
import { fhirDiagnosisToRelevantDiagnosis } from '@fhir/mappers/diagnosis'
import { raise } from '@utils/ts'
import { wait } from '@utils/wait'
import { pdlApiService } from '@services/pdl/pdl-api-service'
import { sykInnApiService } from '@services/syk-inn-api/syk-inn-api-service'
import { getFnrIdent, getNameFromPdl } from '@services/pdl/pdl-api-utils'
import { getHpr, practitionerToBehandler } from '@fhir/mappers/practitioner'
import { createDocumentReference } from '@fhir/fhir-service'
import {
    resolverInputToSykInnApiPayload,
    sykInnApiSykmeldingToResolverSykmelding,
} from '@services/syk-inn-api/syk-inn-api-utils'
import { getOrganisasjonsnummerFromFhir, getOrganisasjonstelefonnummerFromFhir } from '@fhir/mappers/organization'
import { OpprettSykmeldingMeta } from '@services/syk-inn-api/schema/opprett'
import { getFlag, getUserToggles } from '@toggles/unleash'

import { searchDiagnose } from '../common/diagnose-search'
import { getDraftClient } from '../draft/draft-client'
import { DraftValuesSchema } from '../draft/draft-schema'

import { getReadyClientForResolvers } from './smart/smart-client'

export const fhirResolvers: Resolvers<{ readyClient?: ReadyClient }> = {
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

            await wait(700)

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

            await wait(700)

            return {
                navn: getNameFromFhir(patient.name),
                ident: getValidPatientIdent(patient) ?? raise('Patient without valid FNR/DNR'),
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

            const existingDocumentReference = await client.request(`DocumentReference/${sykmeldingId}` as const)

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

            const ident = getValidPatientIdent(patientInContext)
            if (ident == null) {
                logger.error('Missing valid FNR/DNR in patient resource')
                teamLogger.error(`Patient without valid FNR/DNR: ${JSON.stringify(patientInContext, null, 2)}`)
                throw new GraphQLError('API_ERROR')
            }

            const sykmeldinger = await sykInnApiService.getSykmeldinger(ident, hpr)
            if ('errorType' in sykmeldinger) {
                throw new GraphQLError('API_ERROR')
            }

            return sykmeldinger.map((it) => sykInnApiSykmeldingToResolverSykmelding(it))
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
            const draftClient = getDraftClient()

            // TODO verify access to draft
            const draft = await draftClient.getDraft(draftId)

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

            const ident = getValidPatientIdent(pasient)
            if (ident == null) {
                logger.error('Missing valid FNR/DNR in patient resource')
                teamLogger.error(`Patient without valid FNR/DNR: ${JSON.stringify(pasient, null, 2)}`)
                throw new GraphQLError('API_ERROR')
            }

            const draftClient = getDraftClient()

            const allDrafts = await draftClient.getDrafts({ hpr, ident })

            return R.sortBy(allDrafts, [(it) => it.lastUpdated, 'desc'])
        },
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

            const ident = getValidPatientIdent(pasient)
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

            const draftClient = getDraftClient()
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

            const ident = getValidPatientIdent(pasient)
            if (ident == null) {
                logger.error('Missing valid FNR/DNR in patient resource')
                teamLogger.error(`Patient without valid FNR/DNR: ${JSON.stringify(pasient, null, 2)}`)
                throw new GraphQLError('API_ERROR')
            }

            const draftClient = getDraftClient()

            // TODO verify access to draft
            await draftClient.deleteDraft(draftId, { hpr, ident })

            logger.info(`Deleted draft ${draftId} from draft client`)

            return true
        },
        opprettSykmelding: async (_, { draftId, values }) => {
            const [client, practitioner] = await getReadyClientForResolvers({ withPractitioner: true })

            const hpr = getHpr(practitioner.identifier)
            if (hpr == null) {
                logger.error('Missing HPR identifier in practitioner resource')
                teamLogger.error(`Practitioner without HPR: ${JSON.stringify(practitioner, null, 2)}`)
                throw new GraphQLError('PARSING_ERROR')
            }

            // TODO: Fetching these patient, encounter and organization can probably be done a bit more effective
            const pasient = await client.patient.request()
            if ('error' in pasient) {
                throw new GraphQLError('API_ERROR')
            }

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
                teamLogger.error(`Organization without valid orgnummer: ${JSON.stringify(organization, null, 2)}`)
                throw new GraphQLError('API_ERROR')
            }

            const legekontorTlf = getOrganisasjonstelefonnummerFromFhir(organization)
            if (legekontorTlf == null) {
                logger.error('Organization without valid phone number')
                teamLogger.error(`Organization without valid phone number: ${JSON.stringify(organization, null, 2)}`)
                throw new GraphQLError('API_ERROR')
            }

            const pasientIdent = getValidPatientIdent(pasient)
            if (pasientIdent == null) {
                logger.error('Patient without valid FNR/DNR')
                teamLogger.error(`Patient without valid FNR/DNR: ${JSON.stringify(pasient, null, 2)}`)
                throw new GraphQLError('API_ERROR')
            }

            const toggles = await getUserToggles(hpr)
            const isPilotUser = getFlag('PILOT_USER', toggles)
            if (!isPilotUser.enabled) {
                logger.error(
                    `Non-pilot user tried to create a sykmelding, is modal not modalling? See team logs for HPR`,
                )
                teamLogger.error(`Non-pilot user tried to create a sykmelding, is modal not modalling? HPR: ${hpr}`)
                throw new GraphQLError('API_ERROR')
            }

            const meta: OpprettSykmeldingMeta = {
                sykmelderHpr: hpr,
                pasientIdent: pasientIdent,
                legekontorOrgnr: orgnummer,
                legekontorTlf: legekontorTlf,
            }
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
            const draftClient = getDraftClient()
            await draftClient.deleteDraft(draftId, { hpr, ident: pasientIdent })

            return sykInnApiSykmeldingToResolverSykmelding(result, 'PENDING')
        },
        synchronizeSykmelding: async (_, { id: sykmeldingId }) => {
            const [client] = await getReadyClientForResolvers()

            const existingDocument = await client.request(`DocumentReference/${sykmeldingId}`)
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
    OpprettetSykmelding: {
        __resolveType: (parent) => ('sykmeldingId' in parent ? 'Sykmelding' : 'OpprettSykmeldingRuleOutcome'),
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
