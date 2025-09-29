import { collectDefaultMetrics, Counter } from 'prom-client'
import { nextleton } from 'nextleton'

class AppMetrics {
    constructor() {
        collectDefaultMetrics()
    }

    public smartLaunchesTotal = new Counter({
        name: 'syk_inn_smart_launches_total',
        help: 'Total number of smart launches by HPR',
        labelNames: ['hpr'],
    })

    public smartLaunchesNoHprTotal = new Counter({
        name: 'syk_inn_smart_launches_no_hpr_total',
        help: 'Total number of smart launches by users without HPR',
    })
}

export default nextleton('metrics', () => new AppMetrics())
