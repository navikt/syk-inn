import { getAbsoluteURL } from '@utils/url'

import patientEspenEksempel from './patient-espen-eksempel.json'
import practitionerKomanMagnar from './practitioner-koman-magnar.json'
import encounterEspenKoman from './encounter-espen-komar.json'
import { createWellKnown } from './fhir-server/well-known'
import { createKeys } from './fhir-server/keys'
import metadata from './fhir-server/metadata.json'
import { getConditionById, getConditionsByPatientId } from './diagnosis'

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
        'Espen hos Koman': encounterEspenKoman,
    },
    fhirServer: {
        wellKnown: createWellKnown(`${getAbsoluteURL()}/api/mocks/fhir`),
        keys: createKeys(),
        metadata: metadata,
    },
}

export default testData
