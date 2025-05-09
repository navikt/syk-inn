import patientEspenEksempel from './patient-espen-eksempel.json'
import practitionerKomanMagnar from './practitioner-koman-magnar.json'
import { encounterEspenKomar } from './encounter-espen-komar'
import { getConditionById, getConditionsByEncounterId } from './condition'
import { getOrganizationById, organizations } from './organization'

const testData = {
    condition: {
        byId: (id: string) => getConditionById(id),
        byEncounterId: (encounterId: string) => getConditionsByEncounterId(encounterId),
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
    organization: {
        byId: (id: string) => getOrganizationById(id),
        all: () => organizations,
    },
}

export default testData
