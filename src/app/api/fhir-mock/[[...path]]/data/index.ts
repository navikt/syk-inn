import { getAbsoluteURL, urlWithBasePath } from '@utils/url'

import pasientEspenEksempel from './pasient-espen-eksempel.json'
import { createWellKnown } from './fhir-server/well-known'
import metadata from './fhir-server/metadata.json'

const testData = {
    pasient: {
        'Espen Eksempel': pasientEspenEksempel,
    },
    fhirServer: {
        wellKnown: createWellKnown(`${getAbsoluteURL()}${urlWithBasePath('/api/fhir-mock')}`),
        metadata: metadata,
    },
}

export default testData
