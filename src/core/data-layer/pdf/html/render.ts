import { ReactNode } from 'react'

export async function toHTML(children: ReactNode): Promise<string> {
    const { renderToStaticMarkup } = await import('react-dom/server')

    return renderToStaticMarkup(children)
}
