import { logger } from '@navikt/next-logger'

import { raise } from '@utils/ts'
import { wait } from '@utils/wait'
import { FhirBundleOrPatientSchema } from '@fhir/fhir-data/schema/patient'
import { getFastlege, getName, getValidPatientIdent } from '@fhir/fhir-data/schema/mappers/patient'
import { pathWithBasePath } from '@utils/url'

import { PasientInfo } from '../../data-fetcher/data-service'

export async function getFhirPatient(): Promise<PasientInfo> {
    await wait()

    // TODO: Bedre feilhåndtering
    const patient: unknown = await fetch(pathWithBasePath(`/fhir/resources/context/Patient`)).then((it) => it.json())
    const parsed = FhirBundleOrPatientSchema.safeParse(patient)

    if (!parsed.success) {
        logger.error('Failed to parse patient', parsed.error)
        throw parsed.error
    }

    if (parsed.data.resourceType === 'Bundle') {
        raise("We don't support bundles haha")
    }

    return {
        navn: getName(parsed.data.name),
        ident: getValidPatientIdent(parsed.data) ?? raise('Patient without valid FNR/DNR'),
        fastlege: getFastlege(parsed.data),
    }
}
