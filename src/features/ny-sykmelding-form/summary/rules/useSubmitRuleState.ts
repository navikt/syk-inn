import { useReducer } from 'react'

import { RuleOutcomeFragment } from '@queries'

type State =
    | {
          type: 'idle'
      }
    | {
          type: 'rule-outcome'
          outcome: RuleOutcomeFragment
      }
    | {
          type: 'modal-closed'
      }

function reducer(_: State, action: 'close' | { outcome: RuleOutcomeFragment }): State {
    if (action === 'close') {
        return { type: 'modal-closed' }
    } else {
        return { type: 'rule-outcome', outcome: action.outcome }
    }
}

type UseSubmitRuleState = [state: State, { ruled: (outcome: RuleOutcomeFragment) => void; close: () => void }]

export function useSubmitRuleState(): UseSubmitRuleState {
    const [state, dispatch] = useReducer(reducer, { type: 'idle' })

    return [state, { ruled: (outcome) => dispatch({ outcome }), close: () => dispatch('close') }]
}
