'use client'

import { useLayoutEffect } from 'react'

import { ManualPatient } from '@core/redux/reducers/ny-sykmelding/patient'
import { getPersistentUser } from '@data-layer/helseid/persistent-user/persistent-user'
import { useAppDispatch } from '@core/redux/hooks'
import { nySykmeldingActions } from '@core/redux/reducers/ny-sykmelding'

function HydratePersistedUserFromSession(): null {
    const dispatch = useAppDispatch()

    useLayoutEffect(() => {
        const patient = restoreFromSession()

        if (patient) dispatch(nySykmeldingActions.manualPatient(patient))
    }, [dispatch])

    return null
}

function restoreFromSession(): ManualPatient | undefined {
    const persistentUser = getPersistentUser()
    if (!persistentUser) return undefined

    return { type: 'manual' as const, ...persistentUser }
}

export default HydratePersistedUserFromSession
