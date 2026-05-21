export default {
    '*': () => 'yarn fmt',
    '*.{ts,tsx}': (staged) => ['yarn tsgo', `yarn eslint --fix --max-warnings=0 ${staged.join(' ')}`],
}
