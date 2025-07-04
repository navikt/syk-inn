import { FhirOrganization } from '@navikt/smart-on-fhir/zod'
import { logger } from '@navikt/pino-logger'

export const organizations: FhirOrganization[] = [
    {
        resourceType: 'Organization',
        id: '458ae08a-e249-4e16-a9a0-1ba45d358f6c',
        identifier: [
            {
                system: 'urn:oid:2.16.578.1.12.4.1.4.101',
                value: '123456789',
            },
        ],
        name: 'Magnar Legekontor AS',
        telecom: [
            {
                system: 'phone',
                value: '12345678',
            },
            {
                system: 'email',
                value: 'magnar-legekontor@example.com',
            },
        ],
    },
]

export function getOrganizationById(id: string): FhirOrganization | null {
    const condition = organizations.find((it) => it.id === id)
    if (condition == null) {
        logger.warn(`Unable to find condition by id ${id}`)
        return null
    }

    return condition
}
