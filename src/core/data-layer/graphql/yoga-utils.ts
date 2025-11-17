import { YogaServerOptions } from 'graphql-yoga'

import { CurrentPatientExtension } from '@data-layer/graphql/apollo/current-patient-link'

export interface NextContext {
    params: Promise<Record<string, string>>
}

export type YogaContext<UserContext extends Record<string, unknown> = Record<string, unknown>> = YogaServerOptions<
    NextContext,
    UserContext
>['context']

export function getCurrentPatientFromExtension(
    extensions: Record<string, unknown> | CurrentPatientExtension | undefined,
): string | null {
    const ident = extensions?.currentPatient

    return typeof ident === 'string' ? ident : null
}
