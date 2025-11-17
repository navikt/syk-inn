import { ApolloLink } from '@apollo/client'

import { AppStore } from '@core/redux/store'

export type CurrentPatientExtension = {
    currentPatient: string | null
}

/**
 * This link is used to add the current users ident as an GQL extension, allowing any resolver to access it.
 *
 * This is not to be confused with the FHIR Multi Launch (multiUserLink).
 */
export const createCurrentPatientLink = (store: AppStore): ApolloLink =>
    new ApolloLink((operation, forward) => {
        const state = store.getState()

        operation.extensions = {
            ...operation.extensions,
            currentPatient: state.nySykmelding.pasient?.ident ?? null,
        } satisfies CurrentPatientExtension

        return forward(operation)
    })
