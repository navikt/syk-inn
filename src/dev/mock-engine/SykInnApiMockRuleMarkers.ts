import { SykInnApiRuleOutcome } from '@core/services/syk-inn-api/schema/sykmelding'

export const MockRuleMarkers = {
    header: 'Rule-Outcome-Override',
    query: 'submit-mock-rule-override',
    createMarker: (rule: string, status: SykInnApiRuleOutcome['status']) => `${rule}:${status}` as const,
    unwrapMarker: (marker: string) => {
        const [ruleName, status] = marker.split(':')
        return [ruleName, status as SykInnApiRuleOutcome['status']] as const
    },
}

export function createBrowserRuleOverrideHeaders(): { [MockRuleMarkers.header]: string } | undefined {
    const query = new URLSearchParams(window.location.search)
    const type = query.get(MockRuleMarkers.query)
    if (!type) return undefined

    const status = type.startsWith('invalid') ? 'INVALID' : 'MANUAL_PROCESSING'
    const rule = type.endsWith('unexpected') ? 'OVERRIDEN_UNEXPECTED_DEMO_RULE' : 'ICPC_2_Z_DIAGNOSE'

    return { [MockRuleMarkers.header]: MockRuleMarkers.createMarker(rule, status) }
}
