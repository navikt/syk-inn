/**
 * @type {import('lint-staged').Configuration}
 */
const config = {
    '*': () => 'yarn fmt --no-error-on-unmatched-pattern',
    '*.{ts,tsx}': (staged) => ['yarn tsgo', `yarn eslint --fix --max-warnings=0 ${staged.join(' ')}`],
}

export default config
