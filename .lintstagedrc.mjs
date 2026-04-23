export default {
    '*.{md,html,css,json,md,mdx,js,yml,yaml,graphql,graphqls}': () => 'yarn fmt',
    '*.{ts,tsx}': (staged) => ['yarn tsgo', `yarn eslint --fix --max-warnings=0 ${staged.join(' ')}`],
}
