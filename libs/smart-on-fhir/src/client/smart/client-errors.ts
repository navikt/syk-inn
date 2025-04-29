export type CallbackError = {
    error: 'INVALID_STATE'
}

export type SmartClientReadyErrors = {
    error: 'NO_ACTIVE_SESSION' | 'INCOMPLETE_SESSION' | 'INVALID_ID_TOKEN' | 'INVALID_TOKEN'
}

export type ResourceCreateErrors = {
    error: 'CREATE_FAILED_NON_OK_RESPONSE' | 'CREATE_FAILED_INVALID_RESPONSE'
}

export type ResourceRequestErrors = {
    error: 'REQUEST_FAILED_NON_OK_RESPONSE' | 'REQUEST_FAILED_INVALID_RESPONSE' | 'REQUEST_FAILED_RESOURCE_NOT_FOUND'
}
