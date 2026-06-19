import { MockOrganizations } from './data/organization'
import { MockPatients } from './data/patients'
import { MockPractitioners } from './data/practitioner'

export type MockLaunchType =
    `local-dev-launch:${MockPatients}:${MockPractitioners}:${MockOrganizations}:${'with-frame' | 'no-frame'}`
