import { FhirOrganization, FhirPatient, FhirPractitioner } from '@navikt/smart-on-fhir/zod'

import { createPatientSession, PatientSession } from './data/patient-session'
import { createPatientEspenEksempel, createPatientKariNormann, MockPatients } from './data/patients'
import {
    createOrganizationKarlsrud,
    createOrganizationMagmarLegekontor,
    createOrganizationManglerud,
    MockOrganizations,
} from './data/organization'
import {
    createPractitionerBadetteOrganitto,
    createPractitionerKomanMagnar,
    MockPractitioners,
} from './data/practitioner'
import { fhirLogger } from './logger'

type LaunchPayload = {
    patient: MockPatients
    practitioner: MockPractitioners
    organization: MockOrganizations
}

export class FhirMockSession {
    private patients: [MockPatients, FhirPatient][] = [
        ['Espen Eksempel', createPatientEspenEksempel()],
        ['Kari Normann', createPatientKariNormann()],
    ]

    private organizations: [MockOrganizations, FhirOrganization][] = [
        ['Magnar Legekontor', createOrganizationMagmarLegekontor()],
        ['Manglerud', createOrganizationManglerud()],
        ['Karlsrud', createOrganizationKarlsrud()],
    ]

    private practitioners: [MockPractitioners, FhirPractitioner][] = [
        ['Magnar Koman', createPractitionerKomanMagnar()],
        ['Badette Organitto', createPractitionerBadetteOrganitto()],
    ]

    private launches: Record<string, LaunchPayload> = {}

    private sessions: Record<string, PatientSession> = {}

    constructor() {
        fhirLogger.warn('[FhirMockSession] Initialized new FhirMockSession')
    }

    initializeLaunch(code: string, payload: LaunchPayload): void {
        fhirLogger.warn(
            `Initializing launch ${code} for patient ${payload.patient} (${payload.practitioner}/${payload.organization})`,
        )

        this.launches[code] = payload
    }

    completeLaunch(code: string, accessToken: string): PatientSession {
        fhirLogger.warn(`Completing launch for ${code}, got access token (${accessToken.length})`)

        const launchPayload = this.launches[code]
        if (!launchPayload) {
            throw new Error(`No launch found for code ${code}`)
        }

        delete this.launches[code]

        this.sessions[accessToken] = createPatientSession(
            launchPayload.patient,
            this.getPatientByName(launchPayload.patient),
            this.getPractitionerByName(launchPayload.practitioner)!,
            this.getOrganizationByName(launchPayload.organization)!,
        )
        return this.sessions[accessToken]
    }

    getSession(accessToken: string): PatientSession | null {
        return this.sessions[accessToken.replace('Bearer ', '')] ?? null
    }

    getOrganization(organizationId: string): FhirOrganization | null {
        return this.organizations.find((it) => it[1].id === organizationId)?.[1] ?? null
    }

    getAllOrganizations(): FhirOrganization[] {
        return Object.values(this.organizations).map((it) => it[1])
    }

    getPractitioner(practitionerId: string): FhirPractitioner | null {
        return this.practitioners.find((it) => it[1].id === practitionerId)?.[1] ?? null
    }

    getAllPractitioners(): FhirPractitioner[] {
        return Object.values(this.practitioners).map((it) => it[1])
    }

    private getPatientByName(name: MockPatients): FhirPatient {
        const patient = this.patients.find((it) => it[0] === name)
        if (!patient) {
            throw new Error(`No patient found for name ${name}`)
        }
        return patient[1]
    }

    private getPractitionerByName(name: MockPractitioners): FhirPractitioner {
        const practitioner = this.practitioners.find((it) => it[0] === name)
        if (!practitioner) {
            throw new Error(`No practitioner found for name ${name}`)
        }
        return practitioner[1]
    }

    private getOrganizationByName(name: MockOrganizations): FhirOrganization {
        const organization = this.organizations.find((it) => it[0] === name)
        if (!organization) {
            throw new Error(`No organization found for name ${name}`)
        }
        return organization[1]
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
