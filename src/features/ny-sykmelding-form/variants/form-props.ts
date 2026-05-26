export type AllFormVariantsProps = {
    /**
     * When for example forlenging a sykmelding, we need to know the last day+1 from the
     * sykmelding we are forlenging.
     */
    initialFom?: string
    /**
     * Used for contextually relevant error messages
     */
    contextualErrors: {
        diagnose?: { error: 'FHIR_FAILED' }
    }
}
