import { MockPatients } from './data/patients'
import { MockPractitioners } from './data/practitioner'
import { MockOrganizations } from './data/organization'

export type MockLaunchType =
    `local-dev-launch:${MockPatients}:${MockPractitioners}:${MockOrganizations}:${'with-frame' | 'no-frame'}`
