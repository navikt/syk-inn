import type { MDXComponents } from 'mdx/types'
import { BodyLong, Heading, List } from '@navikt/ds-react'

const components: MDXComponents = {
    h1: ({ children }) => (
        <Heading spacing size="large" level="1">
            {children}
        </Heading>
    ),
    h2: ({ children }) => (
        <Heading spacing size="medium" level="2">
            {children}
        </Heading>
    ),
    h3: ({ children }) => (
        <Heading size="small" level="3">
            {children}
        </Heading>
    ),
    h4: ({ children }) => (
        <Heading size="xsmall" level="4">
            {children}
        </Heading>
    ),
    h5: ({ children }) => (
        <Heading size="xsmall" level="5">
            {children}
        </Heading>
    ),
    h6: ({ children }) => (
        <Heading size="xsmall" level="6">
            {children}
        </Heading>
    ),
    p: ({ children }) => <BodyLong spacing>{children}</BodyLong>,
    ul: ({ children }) => (
        <List as="ul" className="mb-4 -mt-6">
            {children}
        </List>
    ),
    ol: ({ children }) => (
        <List as="ol" className="mb-4 -mt-6">
            {children}
        </List>
    ),
    li: ({ children }) => <List.Item>{children}</List.Item>,
}

export function useMDXComponents(): MDXComponents {
    return components
}
