import { useQuery } from '@apollo/client/react'
import { useRef } from 'react'

import { type DiagnoseFragment, KonsultasjonDocument } from '@queries'
import type { NySykmeldingSuggestions } from '@features/ny-sykmelding-form/form/types'
import useOnFocus from '@lib/hooks/useOnFocus'

export function useDiagnoseSuggestions():
    | {
          loading: true
          suggestions: null
      }
    | {
          loading: false
          refetching: boolean
          suggestions: NySykmeldingSuggestions
      } {
    const neverAbortSignal = useRef(new AbortController())
    const konsultasjonsQuery = useQuery(KonsultasjonDocument, {
        /* This lets the consultasjon query finish even when the parent component unmounts */
        context: { signal: neverAbortSignal.current.signal },
    })

    useOnFocus(konsultasjonsQuery.refetch)

    if (konsultasjonsQuery.loading && konsultasjonsQuery.data?.konsultasjon == null) {
        return { loading: true, suggestions: null }
    }

    return {
        loading: false,
        refetching: konsultasjonsQuery.loading,
        suggestions: {
            diagnose: {
                value: pickMostRelevantDiagnose(konsultasjonsQuery.data?.konsultasjon?.diagnoser ?? null),
                error: konsultasjonsQuery.error ? { error: 'FHIR_FAILED' } : undefined,
            },
            bidiagnoser: konsultasjonsQuery.data?.konsultasjon?.diagnoser?.slice(1) ?? null,
        },
    }
}

function pickMostRelevantDiagnose(diagnoser: DiagnoseFragment[] | null): DiagnoseFragment | null {
    if (!diagnoser || diagnoser.length === 0) {
        return null
    }

    return diagnoser[0]
}
