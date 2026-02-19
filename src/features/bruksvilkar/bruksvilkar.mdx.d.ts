declare module '@bruksvilkar.mdx' {
    import { ComponentType } from 'react'

    export const metadata: {
        version: `${number}.${number}`
        updated: string
    }

    const BruksvilkarMarkdown: ComponentType
    export default BruksvilkarMarkdown
}
