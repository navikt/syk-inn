import { useQuery } from '@apollo/client/react'

import { type DiagnoseFragment, KonsultasjonDocument } from '@queries'
import { useFlag } from '@core/toggles/context'
import type { NySykmeldingSuggestions } from '@features/ny-sykmelding-form/form'

export function useDiagnoseSuggestions():
    | {
          loading: true
          suggestions: null
      }
    | {
          loading: false
          suggestions: NySykmeldingSuggestions
      } {
    const konsultasjonsQuery = useQuery(KonsultasjonDocument)
    const serverBidiagnoser = useFlag('SYK_INN_AUTO_BIDIAGNOSER')

    if (konsultasjonsQuery.loading) {
        return { loading: true, suggestions: null }
    }

    return {
        loading: false,
        suggestions: {
            diagnose: {
                value: pickMostRelevantDiagnose(konsultasjonsQuery.data?.konsultasjon?.diagnoser ?? null),
                error: konsultasjonsQuery.error ? { error: 'FHIR_FAILED' } : undefined,
            },
            bidiagnoser: serverBidiagnoser.enabled
                ? (konsultasjonsQuery.data?.konsultasjon?.diagnoser?.slice(1) ?? null)
                : null,
        },
    }
}

function pickMostRelevantDiagnose(diagnoser: DiagnoseFragment[] | null): DiagnoseFragment | null {
    if (!diagnoser || diagnoser.length === 0) {
        return null
    }

    return diagnoser[0]
}
