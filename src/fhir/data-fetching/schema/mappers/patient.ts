import { urnToOidType } from '@fhir/data-fetching/schema/mappers/oid'

import { FhirPatient } from '../patient'
import { Name } from '../common'

export function getName(name: Name): string {
    return `${name[0].given[0]} ${name[0].family}`
}

export function getValidPatientOid(patient: FhirPatient): {
    type: 'fnr' | 'dnr'
    nr: string
} | null {
    if (patient.identifier == null) {
        return null
    }

    const oids = patient.identifier.filter((id) => id.system.startsWith('urn:oid'))
    if (oids.length === 0) {
        return null
    }

    const oidsByType = oids.map((it) => ({
        type: urnToOidType(it.system, it.value),
        nr: it.value,
    }))

    if (!oidsByType.find((oid) => ['fnr', 'dnr'].includes(oid.type))) {
        return null
    }

    const fnr = oidsByType.find((oid) => oid.type === 'fnr')
    if (fnr != null) {
        return {
            type: 'fnr',
            nr: fnr.nr,
        }
    }

    const dnr = oidsByType.find((oid) => oid.type === 'dnr')
    if (dnr != null) {
        return {
            type: 'dnr',
            nr: dnr.nr,
        }
    }

    return null
}
