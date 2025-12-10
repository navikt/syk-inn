import { collectDefaultMetrics, Counter, Histogram } from 'prom-client'
import { nextleton } from 'nextleton'

class AppMetrics {
    constructor() {
        collectDefaultMetrics()
    }

    public appLoadsTotal = new Counter({
        name: 'syk_inn_app_load_total',
        help: 'Total number of smart launches by HPR',
        labelNames: ['hpr', 'mode'] as const,
    })

    public appLoadErrorsTotal = new Counter({
        name: 'syk_inn_app_load_errors_total',
        help: 'Total number of smart launch errors by HPR',
        labelNames: ['mode', 'error_type'] as const,
    })

    public numberOfDiagnosesFetched = new Histogram({
        name: 'syk_inn_number_of_diagnoses_fetched',
        help: 'Histogram of number of diagnoses fetched from FHIR server',
        buckets: [0, 1, 2, 3, 4, 5],
    })

    public createdSykmelding = new Counter({
        name: 'syk_inn_number_of_created_sykmeldinger_total',
        help: 'Histogram of number of created fetched sykmeldinger from FHIR server',
        labelNames: ['hpr', 'outcome'] as const,
    })
}

export default nextleton('metrics', () => new AppMetrics())
