import { FhirOrganization, FhirPractitioner } from '@navikt/smart-on-fhir/zod'
import { logger } from '@navikt/pino-logger'

import { Patients } from './data/patients'
import { createPatientSession, PatientSession } from './data/patient-session'
import { createOrganizationMagmarLegekontor } from './data/static/organization'
import { createPractitionerKomanMagnar } from './data/static/practitioner-koman-magnar'

export class FhirMockSession {
    private organizations: Record<string, FhirOrganization> = {}

    private practitioners: Record<string, FhirPractitioner> = {}

    private launches: Record<string, Patients> = {}

    private sessions: Record<string, PatientSession> = {}

    constructor() {
        logger.warn('[FhirMockSession] Initialized new FhirMockSession')

        const org1 = createOrganizationMagmarLegekontor()
        this.organizations[org1.id] = org1

        const magnar = createPractitionerKomanMagnar()
        this.practitioners[magnar.id] = magnar
    }

    initializeLaunch(code: string, patient: Patients): void {
        logger.warn(`Initializing launch ${code} for patient ${patient}`)

        this.launches[code] = patient
    }

    completeLaunch(code: string, accessToken: string): PatientSession {
        logger.warn(`Completing launch for ${code}, got access token (${accessToken.length})`)

        const patient = this.launches[code]
        if (!patient) {
            throw new Error(`No launch found for code ${code}`)
        }

        delete this.launches[code]

        this.sessions[accessToken] = createPatientSession(
            patient,
            // Future feature: Support for launching with different practitioners and organizations
            this.getAllPractitioners()[0],
            this.getAllOrgsanizations()[0],
        )
        return this.sessions[accessToken]
    }

    getSession(accessToken: string): PatientSession | null {
        return this.sessions[accessToken.replace('Bearer ', '')] ?? null
    }

    getOrganization(organizationId: string): FhirOrganization | null {
        return this.organizations[organizationId] ?? null
    }

    getAllOrgsanizations(): FhirOrganization[] {
        return Object.values(this.organizations)
    }

    getPractitioner(practitionerId: string): FhirPractitioner | null {
        return this.practitioners[practitionerId] ?? null
    }

    getAllPractitioners(): FhirPractitioner[] {
        return Object.values(this.practitioners)
    }

    dump(): unknown {
        return {
            organizations: this.organizations,
            practitioners: this.practitioners,
            launches: this.launches,
            sessions: this.sessions,
        }
    }
}
