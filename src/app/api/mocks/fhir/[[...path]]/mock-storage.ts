import { lazyNextleton } from 'nextleton'

import { FhirMockSession } from '@navikt/fhir-mock-server/next'

export const getMockStore = lazyNextleton('mock-session', () => new FhirMockSession())
