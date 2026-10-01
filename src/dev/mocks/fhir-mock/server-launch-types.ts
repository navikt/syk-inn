import { MockOrganizations } from './data/organization'
import { MockPatients } from './data/patients'

export type MockLaunchType = `local-dev-launch:${MockPatients}:${MockOrganizations}:${'with-frame' | 'no-frame'}`
