import { collectDefaultMetrics, Counter } from 'prom-client'
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
}

export default nextleton('metrics', () => new AppMetrics())
