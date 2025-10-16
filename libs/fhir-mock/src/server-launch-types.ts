import { MockPatients } from './data/patients'
import { MockPractitioners } from './data/practitioner'
import { MockOrganizations } from './data/organization'

type PatientLaunch = `local-dev-launch:${MockPatients}`
type PractitionerLaunch = `local-dev-launch:${MockPatients}:${MockPractitioners}`
type OrganizationLaunch = `local-dev-launch:${MockPatients}:${MockPractitioners}:${MockOrganizations}`

export type MockLaunchType = PatientLaunch | PractitionerLaunch | OrganizationLaunch
