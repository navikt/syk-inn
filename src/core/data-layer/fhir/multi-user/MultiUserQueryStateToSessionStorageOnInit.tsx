'use client'

import { useLayoutEffect } from 'react'
import { useQueryState } from 'nuqs'

import { MULTI_USER_SESSION_STORAGE_KEY } from '@data-layer/fhir/multi-user/multi-user-const'

/**
 * During an multi-user launch using the SmartClient, when the user is redirected back to the app, the URL
 * will contain a `?patient=...` query parameter. This component reads that parameter using `useQueryState`
 * and stores it in sessionStorage, so that it can be passed back to the server during the Apollo requests.
 */
function MultiUserQueryStateToSessionStorageOnInit(): null {
    const [patient, setPatient] = useQueryState('patient', {
        clearOnDefault: true,
        defaultValue: '',
        shallow: true,
    })

    useLayoutEffect(() => {
        if (!patient) return

        sessionStorage.setItem(MULTI_USER_SESSION_STORAGE_KEY, patient)

        setPatient(null)
    }, [patient, setPatient])

    return null
}

export default MultiUserQueryStateToSessionStorageOnInit
