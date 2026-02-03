const FEEDBACK_KEY_PREFIX = 'feedback:'

export function feedbackValkeyKey(id: string): string {
    if (id.startsWith(FEEDBACK_KEY_PREFIX)) return id
    return `${FEEDBACK_KEY_PREFIX}:${id}`
}
