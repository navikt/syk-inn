import { FhirMockSession } from '@navikt/fhir-mock-server/next'
import { lazyNextleton } from 'nextleton'

export const getMockStore = lazyNextleton('mock-session', () => new FhirMockSession())
