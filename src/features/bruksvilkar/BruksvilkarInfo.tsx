import * as z from 'zod'
import { ReactElement } from 'react'
import { Detail, Heading } from '@navikt/ds-react'

import { toReadableDateTime } from '@lib/date'

import { DateTime } from '../../../libs/syk-zara/src/schema/common'

import BruksvilkarMarkdown, { metadata } from './bruksvilkar.mdx'

export const BRUKSVILKAR_VERSION = metadata.version
export const BRUKSVILKAR_TIMESTAMP = metadata.updated

/**
 * Sanity check so that non-technical people updating the markdown doesn't break anything.
 */
const parsed = z
    .object({
        version: z.templateLiteral([z.number(), '.', z.number()]),
        updated: DateTime,
    })
    .safeParse({
        version: BRUKSVILKAR_VERSION,
        updated: BRUKSVILKAR_TIMESTAMP,
    })

if (!parsed.success) {
    throw new Error(
        `Someone has messed up the markdown metadata, either ${BRUKSVILKAR_VERSION} isn't a valid version, or ${BRUKSVILKAR_TIMESTAMP} isn't a valid date`,
        { cause: parsed.error },
    )
}

export function ActualBruksvilkar(): ReactElement {
    return (
        <section aria-labelledby="bruksvilkar-overskrift">
            <Heading size="small" level="3" id="bruksvilkar-overskrift">
                Bruksvilkår for applikasjonen Nav sykmelding versjon {BRUKSVILKAR_VERSION}
            </Heading>
            <Detail spacing>Sist endret: {toReadableDateTime(BRUKSVILKAR_TIMESTAMP)}</Detail>
            <div className="max-w-prose bg-ax-bg-raised border border-ax-border-neutral-subtle rounded-md p-3 max-h-140 overflow-auto">
                <BruksvilkarMarkdown />
            </div>
        </section>
    )
}
