import pasientEspenEksempel from './pasient-espen-eksempel.json'
import wellKnown from './fhir-server/well-known.json'
import metadata from './fhir-server/metadata.json'

const testData = {
    pasient: {
        'Espen Eksempel': pasientEspenEksempel,
    },
    fhirServer: {
        wellKnown: wellKnown,
        metadata: metadata,
    },
}

export default testData
