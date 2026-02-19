import type { MDXComponents } from 'mdx/types'
import { BodyLong, Heading, List, Table, Link as AkselLink } from '@navikt/ds-react'

import styles from './mdx-components.module.css'

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
    table: ({ children }) => (
        <Table size="small" className="-mt-6 mb-6">
            {children}
        </Table>
    ),
    thead: ({ children }) => <Table.Header>{children}</Table.Header>,
    tbody: ({ children }) => <Table.Body>{children}</Table.Body>,
    tr: ({ children }) => <Table.Row>{children}</Table.Row>,
    th: ({ children }) => (
        <Table.HeaderCell scope="col" textSize="small">
            {children}
        </Table.HeaderCell>
    ),
    td: ({ children }) => (
        <Table.DataCell textSize="small" className={styles.listsInTd}>
            {children}
        </Table.DataCell>
    ),
    a: ({ children, href }) => <AkselLink href={href}>{children}</AkselLink>,
}

export function useMDXComponents(): MDXComponents {
    return components
}
