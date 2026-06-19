import navikt from '@navikt/ds-tailwind'
import type { Config } from 'tailwindcss'

const config: Config = {
    presets: [navikt],
    content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
    plugins: [],
}
export default config
