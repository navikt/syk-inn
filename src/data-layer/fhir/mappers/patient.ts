import { FhirPatient, Name } from '@navikt/fhir-zod'

import { userUrnToOidType } from './practitioner'

export function getNameFromFhir(name: Name): string {
    return `${name[0].given[0]} ${name[0].family}`
}

export function getValidPatientIdent(patient: FhirPatient): string | null {
    if (patient.identifier == null) {
        return null
    }

    const oids = patient.identifier.filter((id) => id.system.startsWith('urn:oid'))
    if (oids.length === 0) {
        return null
    }

    const oidsByType = oids.map((it) => ({
        type: userUrnToOidType(it.system, it.value),
        nr: it.value,
    }))

    if (!oidsByType.find((oid) => ['fnr', 'dnr'].includes(oid.type))) {
        return null
    }

    const fnr = oidsByType.find((oid) => oid.type === 'fnr')
    if (fnr != null) {
        return fnr.nr
    }

    const dnr = oidsByType.find((oid) => oid.type === 'dnr')
    if (dnr != null) {
        return dnr.nr
    }

    return null
}
