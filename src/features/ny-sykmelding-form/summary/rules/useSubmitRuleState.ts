import { useReducer } from 'react'

import { RuleOutcomeFragment } from '@queries'
import { getRuleType } from '@features/ny-sykmelding-form/summary/rules/rule-texts'

type State =
    | {
          type: 'idle'
      }
    | {
          type: 'rule-outcome'
          outcome: RuleOutcomeFragment
          ruleType: 'hard' | 'soft' | 'unknown'
      }
    | {
          type: 'modal-closed'
      }

function reducer(_: State, action: 'close' | 'reset' | { outcome: RuleOutcomeFragment }): State {
    if (action === 'close') {
        return { type: 'modal-closed' }
    } else if (action === 'reset') {
        return { type: 'idle' }
    } else {
        return { type: 'rule-outcome', outcome: action.outcome, ruleType: getRuleType(action.outcome.rule) }
    }
}

type UseSubmitRuleState = [
    state: State,
    {
        ruled: (outcome: RuleOutcomeFragment) => void
        close: () => void
        reset: () => void
    },
]

export function useSubmitRuleState(): UseSubmitRuleState {
    const [state, dispatch] = useReducer(reducer, { type: 'idle' })

    return [
        state,
        {
            ruled: (outcome) => dispatch({ outcome }),
            close: () => dispatch('close'),
            reset: () => dispatch('reset'),
        },
    ]
}
