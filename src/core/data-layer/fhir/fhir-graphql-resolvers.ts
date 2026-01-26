import { GraphQLError } from 'graphql/error'
import { logger } from '@navikt/next-logger'
import * as R from 'remeda'
import { teamLogger } from '@navikt/next-logger/team-log'
import { cookies } from 'next/headers'

import { Behandler, QueriedPerson, Resolvers } from '@resolvers'
import { createSchema } from '@data-layer/graphql/create-schema'
import { getNameFromFhir, getValidPatientIdent } from '@data-layer/fhir/mappers/patient'
import { fhirDiagnosisToRelevantDiagnosis } from '@data-layer/fhir/mappers/diagnosis'
import { practitionerToBehandler } from '@data-layer/fhir/mappers/practitioner'
import { createDocumentReference, getAllSykmeldingMetaFromFhir } from '@data-layer/fhir/fhir-service'
import {
    getOrganisasjonsnummerFromFhir,
    getOrganisasjonstelefonnummerFromFhir,
} from '@data-layer/fhir/mappers/organization'
import { commonTypeResolvers } from '@data-layer/graphql/common-type-resolvers'
import { pdlApiService } from '@core/services/pdl/pdl-api-service'
import { sykInnApiService } from '@core/services/syk-inn-api/syk-inn-api-service'
import { getFnrIdent, formatPdlName } from '@core/services/pdl/pdl-api-utils'
import {
    resolverInputToSykInnApiPayload,
    sykInnApiSykmeldingRedactedToResolverSykmelding,
    sykInnApiSykmeldingToResolverSykmelding,
    sykInnApiSykmeldingToResolverSykmeldingFull,
} from '@core/services/syk-inn-api/syk-inn-api-utils'
import { OpprettSykmeldingMeta } from '@core/services/syk-inn-api/schema/opprett'
import { getFlag, getUserToggles } from '@core/toggles/unleash'
import { raise } from '@lib/ts'
import { commonObjectResolvers, commonQueryResolvers } from '@data-layer/graphql/common-resolvers'
import { FhirGraphqlContext } from '@data-layer/fhir/fhir-graphql-context'
import { getHasRequestedAccessToSykmeldinger } from '@core/session/session'
import { HAS_REQUESTED_ACCESS_COOKIE_NAME } from '@core/session/cookies'
import { byCurrentOrPreviousWithOffset } from '@data-layer/common/sykmelding-utils'
import { countDiagnoses } from '@data-layer/common/diagnose-counting'
import metrics from '@lib/prometheus/metrics'

import { getDraftClient } from '../draft/draft-client'
import { DraftValuesSchema } from '../draft/draft-schema'

const fhirResolvers: Resolvers<FhirGraphqlContext> = {
    Query: {
        behandler: async (_, _args, { client, practitioner }) => {
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
                logger.error(
                    `Organization without valid phone number, but we found ${organization.telecom.map((it) => it.system).join(', ')}`,
                )
                throw new GraphQLError('API_ERROR')
            }

            return {
                ...practitionerToBehandler(practitioner),
                orgnummer,
                legekontorTlf,
            } satisfies Behandler
        },
        pasient: async (_, _args, { client }) => {
            const patient = await client.patient.request()
            if ('error' in patient) {
                throw new GraphQLError('PARSING_ERROR')
            }

            return {
                navn: getNameFromFhir(patient.name),
                ident: getValidPatientIdent(patient.identifier) ?? raise('Patient without valid FNR/DNR'),
            }
        },
        konsultasjon: async () => ({}),
        sykmelding: async (_, { id: sykmeldingId }, { client, hpr }) => {
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
        sykmeldinger: async (_, _args, { client, hpr, practitioner }) => {
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

            const mappedSykmeldinger = sykmeldinger.map((it) => {
                return it.kind === 'redacted'
                    ? sykInnApiSykmeldingRedactedToResolverSykmelding(it)
                    : sykInnApiSykmeldingToResolverSykmelding(it)
            })

            const [current, historical] = R.partition(mappedSykmeldinger, byCurrentOrPreviousWithOffset)

            // TODO: Get hasRequestedAccess from session
            const hasRequestedAccessToSykmeldinger = await getHasRequestedAccessToSykmeldinger(
                practitioner.id,
                patientInContext.id,
            )

            return { current, historical: hasRequestedAccessToSykmeldinger ? historical : [] }
        },
        person: async (_, { ident }) => {
            if (!ident) throw new GraphQLError('MISSING_IDENT')

            const person = await pdlApiService.getPdlPerson(ident)
            if ('errorType' in person) {
                throw new GraphQLError('API_ERROR')
            }

            return {
                ident: getFnrIdent(person.identer) ?? raise('Person without valid FNR/DNR, hows that possible?'),
                navn: formatPdlName(person.navn),
            } satisfies QueriedPerson
        },
        draft: async (_, { draftId }, { client, hpr }) => {
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
            const draft = await draftClient.getDraft(draftId, { hpr, ident })

            if (draft == null) return null

            return {
                draftId,
                values: draft.values,
                lastUpdated: draft.lastUpdated,
            }
        },
        drafts: async (_, _args, { client, hpr }) => {
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
        saveDraft: async (_, { draftId, values }, { client, hpr }) => {
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
        deleteDraft: async (_, { draftId }, { client, hpr }) => {
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
        opprettSykmelding: async (
            _,
            { draftId, values, force },
            { client, hpr, patientIdent: contextPatientIdent },
        ) => {
            const { pasientIdent, legekontorOrgnr, legekontorTlf } = await getAllSykmeldingMetaFromFhir(client)

            if (contextPatientIdent !== pasientIdent) {
                throw new GraphQLError('PASIENT_IDENT_MISMATCH')
            }

            const opprettMeta: OpprettSykmeldingMeta = {
                source: `${client.issuerName} (FHIR)`,
                sykmelderHpr: hpr,
                pasientIdent,
                legekontorOrgnr,
                legekontorTlf,
            }
            const payload = resolverInputToSykInnApiPayload(draftId, values, opprettMeta)

            if (!force) {
                // When not forcing, we first verify the sykmelding
                const verifyResult = await sykInnApiService.verifySykmelding(payload)
                if (typeof verifyResult === 'object' && 'errorType' in verifyResult) {
                    throw new GraphQLError('API_ERROR')
                }

                if (typeof verifyResult === 'object' && 'status' in verifyResult) {
                    // There are rule outcomes, short circuit and return them
                    return verifyResult
                }

                if (typeof verifyResult === 'object' && verifyResult.message === 'Person does not exist') {
                    return { cause: 'PATIENT_NOT_FOUND_IN_PDL' }
                }

                // No rule hits, proceed to create the sykmelding
            }

            const result = await sykInnApiService.opprettSykmelding(payload)
            if ('errorType' in result) {
                throw new GraphQLError('API_ERROR')
            }

            metrics.createdSykmelding.inc(
                {
                    hpr: hpr,
                    outcome: result.utfall.result,
                },
                1,
            )

            countDiagnoses(values, 'fhir')

            // Delete the draft after successful creation
            const draftClient = await getDraftClient()
            await draftClient.deleteDraft(draftId, { hpr: hpr, ident: pasientIdent })

            return sykInnApiSykmeldingToResolverSykmeldingFull(result, 'PENDING')
        },
        synchronizeSykmelding: async (_, { id: sykmeldingId }, { client }) => {
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
        requestAccessToSykmeldinger: async (_, __, { client, practitioner }) => {
            const pasient = await client.patient.request()
            if ('error' in pasient) {
                throw new GraphQLError('API_ERROR')
            }

            // TODO: Trigger auditlog

            const cookieStore = await cookies()
            cookieStore.set({
                name: `${HAS_REQUESTED_ACCESS_COOKIE_NAME}_${practitioner.id}_${pasient.id}`,
                value: 'true',
                httpOnly: true,
                maxAge: 3600,
                secure: true,
            })
            return true
        },
    },
    Konsultasjon: {
        hasRequestedAccessToSykmeldinger: async (_, _args, { client, practitioner }) => {
            const patientInContext = await client.patient.request()
            if ('error' in patientInContext) {
                throw new GraphQLError('PARSING_ERROR')
            }

            return getHasRequestedAccessToSykmeldinger(practitioner.id, patientInContext.id)
        },
        diagnoser: async (_, _args, { client }) => {
            const conditionsByEncounter = await client.request(`Condition?encounter=${client.encounter.id}`)
            if ('error' in conditionsByEncounter) {
                throw new GraphQLError('PARSING_ERROR')
            }

            if (conditionsByEncounter.entry == null) {
                metrics.numberOfDiagnosesFetched.observe(0)
                return []
            }

            const conditionList = conditionsByEncounter.entry.map((it) => it.resource)
            metrics.numberOfDiagnosesFetched.observe(conditionList.length)

            return fhirDiagnosisToRelevantDiagnosis(conditionList)
        },
    },
    ...commonObjectResolvers,
    ...commonTypeResolvers,
}

export const fhirSchema = createSchema(fhirResolvers)
