/**
 * @type {import('lint-staged').Configuration}
 */
const config = {
    '*': () => 'yarn fmt --no-error-on-unmatched-pattern',
    '*.{ts,tsx,js,ts,mjs,mts}': 'yarn lint',
    '*.{ts,tsx}': () => 'yarn tsgo',
}

export default config
