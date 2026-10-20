const EXPECTED_BUCKET_NAME = 'tsm-syk-inn-pdf-dev'

export function assertCorrectBucket(name: string): asserts name is typeof EXPECTED_BUCKET_NAME {
    if (name !== EXPECTED_BUCKET_NAME) {
        throw new Error(`Unexpected bucket name: ${name}, should be ${EXPECTED_BUCKET_NAME}`)
    }
}

export const objectAlreadyExistsError = {
    error: {
        code: 412,
        message: 'The object already exists',
        errors: [{ domain: 'global', reason: 'conditionNotMet', message: 'The object already exists' }],
    },
}
export const objectNotFoundError = {
    error: {
        code: 404,
        message: 'The object does not exist',
        errors: [{ domain: 'global', reason: 'notFound', message: 'The object does not exist' }],
    },
}
