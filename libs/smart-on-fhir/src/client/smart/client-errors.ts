import { SmartStorageErrors } from '../storage'

export type CallbackError = {
    error: 'INVALID_STATE'
}

export type SessionStorageErrors = SmartStorageErrors | { error: 'INCOMPLETE_SESSION' }

export type SmartClientReadyErrors =
    | SessionStorageErrors
    | { error: 'NO_ACTIVE_SESSION' | 'INVALID_ID_TOKEN' | 'INVALID_TOKEN' | 'REFRESH_FAILED' }

export type ResourceCreateErrors = {
    error: 'CREATE_FAILED_NON_OK_RESPONSE' | 'CREATE_FAILED_INVALID_RESPONSE'
}

export type ResourceRequestErrors = {
    error: 'REQUEST_FAILED_NON_OK_RESPONSE' | 'REQUEST_FAILED_INVALID_RESPONSE' | 'REQUEST_FAILED_RESOURCE_NOT_FOUND'
}
