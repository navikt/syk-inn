import patientEspenEksempel from './patient-espen-eksempel.json'
import practitionerKomanMagnar from './practitioner-koman-magnar.json'
import { encounterEspenKomar } from './encounter-espen-komar'
import { getConditionById, getConditionsByEncounterId } from './condition'

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
}

export default testData
