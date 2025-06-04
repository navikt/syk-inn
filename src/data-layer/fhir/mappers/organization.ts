import { FhirOrganization } from '@navikt/fhir-zod'

const ORG_NR_OID = '2.16.578.1.12.4.1.4.101'

export function getOrganisasjonsnummerFromFhir(organization: FhirOrganization): string | null {
    const orgNrIdentifier = organization.identifier?.find((id) => id.system === `urn:oid:${ORG_NR_OID}`)

    if (!orgNrIdentifier) {
        return null
    }

    return orgNrIdentifier.value
}

export function getOrganisasjonstelefonnummerFromFhir(organization: FhirOrganization): string | null {
    const phoneIdentifier = organization.telecom?.find((telecom) => telecom.system === 'phone')

    if (!phoneIdentifier) {
        return null
    }

    return phoneIdentifier.value
}
