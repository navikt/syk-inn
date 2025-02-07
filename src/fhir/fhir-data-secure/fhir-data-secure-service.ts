import { logger } from '@navikt/next-logger'

import { raise } from '@utils/ts'
import { wait } from '@utils/wait'
import { FhirBundleOrPatientSchema } from '@fhir/fhir-data/schema/patient'
import { getFastlege, getName, getValidPatientOid } from '@fhir/fhir-data/schema/mappers/patient'

import { BehandlerInfo, DataService, NotAvailable, PasientInfo } from '../../data-fetcher/data-service'

export function createSecureFhirDataService(behandler: BehandlerInfo): DataService {
    return {
        mode: 'fhir',
        context: {
            behandler,
            pasient: () => getFhirPatient(),
            konsultasjon: NotAvailable,
            arbeidsgivere: NotAvailable,
        },
        query: {
            pasient: (ident) => raise('TODO'),
            sykmelding: (id) => raise('TODO'),
        },
        mutation: {
            sendSykmelding: (values) => raise('TODO'),
        },
    }
}

async function getFhirPatient(): Promise<PasientInfo> {
    await wait()

    // TODO: Bedre feilhåndtering
    const patient: unknown = await fetch(`/fhir/resources/context/Patient`).then((it) => it.json())
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
        oid: getValidPatientOid(parsed.data),
        fastlege: getFastlege(parsed.data),
    }
}
