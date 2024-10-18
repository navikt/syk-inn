import { getAbsoluteURL } from '@utils/url'

import pasientEspenEksempel from './pasient-espen-eksempel.json'
import practitionerKomanMagnar from './practitioner-koman-magnar.json'
import { createWellKnown } from './fhir-server/well-known'
import { createKeys } from './fhir-server/keys'
import metadata from './fhir-server/metadata.json'

const testData = {
    pasient: {
        'Espen Eksempel': pasientEspenEksempel,
    },
    practitioner: {
        'Koman Magnar': practitionerKomanMagnar,
    },
    fhirServer: {
        wellKnown: createWellKnown(`${getAbsoluteURL()}/api/fhir-mock`),
        keys: createKeys(),
        metadata: metadata,
    },
}

export default testData
