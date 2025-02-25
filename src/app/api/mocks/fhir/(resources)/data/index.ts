import { getAbsoluteURL } from '@utils/url'

import patientEspenEksempel from './patient-espen-eksempel.json'
import practitionerKomanMagnar from './practitioner-koman-magnar.json'
import { encounterEspenKomar } from './encounter-espen-komar'
import { createWellKnown } from './fhir-server/well-known'
import { createKeys } from './fhir-server/keys'
import metadata from './fhir-server/metadata.json'
import { getConditionById, getConditionsByPatientId } from './condition'

const testData = {
    condition: {
        byId: (id: string) => getConditionById(id),
        byPatientId: (patientId: string) => getConditionsByPatientId(patientId),
    },
    patient: {
        'Espen Eksempel': patientEspenEksempel,
    },
    practitioner: {
        'Koman Magnar': practitionerKomanMagnar,
    },
    encounter: {
        'Espen hos Koman': encounterEspenKomar,
    },
    fhirServer: {
        wellKnown: createWellKnown(`${getAbsoluteURL()}/api/mocks/fhir`),
        keys: () => createKeys(),
        metadata: metadata,
    },
}

export default testData
