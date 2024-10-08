import { FhirPatient } from '../patient'

export function getName(patient: FhirPatient): string {
    return `${patient.name[0].given[0]} ${patient.name[0].family}`
}

export function getOid(patient: FhirPatient): string {
    return patient.identifier.find((id) => id.system === 'urn:oid')?.value ?? patient.identifier?.[0].value ?? null
}
