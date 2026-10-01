import { lazyNextleton } from 'nextleton'

import { FhirMockSession } from '#fhir-mock-server/next'

export const getMockStore = lazyNextleton('mock-session', () => new FhirMockSession())
