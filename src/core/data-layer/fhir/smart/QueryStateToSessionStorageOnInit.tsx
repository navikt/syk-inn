'use client'

import { useLayoutEffect } from 'react'
import { useQueryState } from 'nuqs'

function QueryStateToSessionStorageOnInit(): null {
    const [patient, setPatient] = useQueryState('patient', {
        clearOnDefault: true,
        defaultValue: '',
        shallow: true,
    })

    useLayoutEffect(() => {
        if (!patient) return

        sessionStorage.setItem('FHIR_ACTIVE_PATIENT', patient)

        setPatient(null)
    }, [patient, setPatient])

    return null
}

export default QueryStateToSessionStorageOnInit
