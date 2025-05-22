export default {
    '*.{md,html,css,json,md,mdx,js,yml,yaml}': 'yarn prettier --write',
    '*.{ts,tsx}': (staged) => ['yarn tsc', `yarn eslint --fix --max-warnings=0 ${staged.join(' ')}`],
}
