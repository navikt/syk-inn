import { getAbsoluteURL } from '@utils/url'

import patientEspenEksempel from './patient-espen-eksempel.json'
import practitionerKomanMagnar from './practitioner-koman-magnar.json'
import { createWellKnown } from './fhir-server/well-known'
import { createKeys } from './fhir-server/keys'
import metadata from './fhir-server/metadata.json'

const testData = {
    patient: {
        'Espen Eksempel': patientEspenEksempel,
    },
    practitioner: {
        'Koman Magnar': practitionerKomanMagnar,
    },
    fhirServer: {
        wellKnown: createWellKnown(`${getAbsoluteURL()}/api/mocks/fhir`),
        keys: createKeys(),
        metadata: metadata,
    },
}

export default testData
