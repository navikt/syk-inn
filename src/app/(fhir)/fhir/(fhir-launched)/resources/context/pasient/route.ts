import { pasientRoute } from '@data-layer/api-routes/route-handlers'
import { getFastlege, getName, getValidPatientIdent } from '@data-layer/fhir/mappers/patient'
import { raise } from '@utils/ts'
import { getReadyClient } from '@data-layer/fhir/smart-client'

export const GET = pasientRoute(async () => {
    const client = await getReadyClient({ validate: true })
    if ('error' in client) {
        return { error: 'AUTH_ERROR' }
    }

    const patientInContext = await client.request(`/Patient/${client.patient}`)
    if ('error' in patientInContext) {
        return { error: 'PARSING_ERROR' }
    }

    return {
        navn: getName(patientInContext.name),
        ident: getValidPatientIdent(patientInContext) ?? raise('Patient without valid FNR/DNR'),
        fastlege: getFastlege(patientInContext),
    }
})
