import type * as queries from '@queries'

export type ToggleableQueries = keyof {
    [K in keyof typeof queries as K extends `${infer Name}Document` ? Name : never]: (typeof queries)[K]
}
