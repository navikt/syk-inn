import metrics from '@lib/prometheus/metrics'
import { OpprettSykmeldingInput } from '@resolvers'

export function countDiagnoses(values: OpprettSykmeldingInput, source: 'fhir' | 'helseid'): void {
    if (values.hoveddiagnose) {
        metrics.diagnoseCounter.inc(
            {
                system: values.hoveddiagnose.system,
                code: values.hoveddiagnose.code,
                type: 'hoveddiagnose',
                source,
            },
            1,
        )
    }
    if (values.bidiagnoser && values.bidiagnoser.length > 0) {
        values.bidiagnoser.forEach((diagnose) => {
            metrics.diagnoseCounter.inc(
                {
                    system: diagnose.system,
                    code: diagnose.code,
                    type: 'bidiagnose',
                    source,
                },
                1,
            )
        })
    }
}
