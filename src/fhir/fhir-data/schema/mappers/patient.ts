import { logger } from '@navikt/next-logger'

import { getHpr, userUrnToOidType } from '@fhir/fhir-data/schema/mappers/practitioner'
import { raise } from '@utils/ts'

import { FhirPatient } from '../patient'
import { Name } from '../common'

export function getName(name: Name): string {
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

export function getFastlege(patient: FhirPatient): {
    hpr: string
    navn: string
} | null {
    if (patient.generalPractitioner == null) {
        return null
    }

    const legeMedHpr = patient.generalPractitioner.find((it) => getHpr(it.identifier) != null)
    if (legeMedHpr == null) {
        logger.warn('Fant liste med fastleger, men ingen hadde gyldig HPR identifier')
        return null
    }

    return {
        hpr:
            getHpr(legeMedHpr.identifier) ??
            raise('Fastlege uten HPR, men vi har allerede funnet personen så dette er umulig'),
        navn: legeMedHpr.display,
    }
}
