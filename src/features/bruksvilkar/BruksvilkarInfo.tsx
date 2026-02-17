import { ReactElement } from 'react'
import { BodyLong, Detail, Heading } from '@navikt/ds-react'

import { toReadableDateTime } from '@lib/date'

export const BRUKSVILKAR_VERSION = '0.0'
export const BRUKSVILKAR_TIMESTAMP = '2026-02-17T14:32:03.686Z'

export function ActualBruksvilkar(): ReactElement {
    return (
        <div className="max-w-prose bg-ax-bg-raised border border-ax-border-neutral-subtle rounded-md p-3">
            <Heading size="small" level="3">
                Bruksvilkår for ny sykmelding, versjon {BRUKSVILKAR_VERSION}
            </Heading>
            <Detail spacing>Sist endret: {toReadableDateTime(BRUKSVILKAR_TIMESTAMP)}</Detail>
            <BodyLong spacing>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam a viverra arcu. Phasellus vitae nisi
                efficitur, cursus elit eu, pretium sem. Aenean bibendum lectus ligula, fermentum dictum lectus blandit
                et. Sed euismod dui nisi, pellentesque placerat nisl faucibus vel. Phasellus ligula orci, finibus vitae
                vestibulum id, blandit at massa. Donec pharetra nisl et libero euismod, ut cursus dui interdum. Praesent
                in est lorem. Phasellus imperdiet quam vitae dui commodo gravida. Pellentesque ut purus eget lectus
                dapibus viverra. Nulla facilisi.
            </BodyLong>
            <BodyLong spacing>
                Donec ac dictum ipsum. Donec dapibus massa nibh, in aliquet lacus imperdiet at. Nullam luctus
                ullamcorper justo, sit amet sollicitudin arcu facilisis ut. Nullam laoreet condimentum neque, in viverra
                sapien mattis quis. In condimentum, purus in condimentum ornare, magna dolor iaculis enim, vitae auctor
                nisi dolor et lacus. Sed sed euismod diam. Aliquam cursus nisl ut erat bibendum, dapibus pretium enim
                vehicula. Etiam placerat ultricies nunc dapibus rhoncus. Ut sed vulputate enim, elementum maximus dolor.
                Ut auctor diam at tortor mattis, semper pretium nisi ornare.
            </BodyLong>
            <BodyLong spacing>
                Nullam scelerisque tortor sed libero pellentesque condimentum nec non mi. Duis quis auctor velit, at
                congue ipsum. Phasellus faucibus, nisi posuere cursus blandit, augue elit ullamcorper orci, quis
                fringilla dui libero non elit. Suspendisse efficitur consectetur magna nec lobortis. Morbi sodales eu
                justo vel vestibulum. Curabitur vitae dui eu est sollicitudin consectetur. Vestibulum hendrerit vehicula
                sagittis. Donec id suscipit dui. Integer viverra enim ut lorem sollicitudin malesuada.
            </BodyLong>
            <BodyLong spacing>
                Nunc eu turpis scelerisque, semper ex vitae, cursus enim. Nunc ac bibendum est. Ut nec nunc scelerisque,
                maximus tortor nec, feugiat nulla. Nulla nec est non ipsum ullamcorper feugiat. Maecenas laoreet
                placerat ullamcorper. Cras rhoncus eget massa ultrices pulvinar. Cras turpis ante, faucibus ut dui eget,
                commodo posuere sapien.
            </BodyLong>
            <BodyLong>
                Phasellus nisi orci, malesuada sed orci eu, iaculis malesuada augue. Sed porttitor velit risus, sit amet
                pretium tellus cursus a. Proin eu lacinia odio. Donec efficitur aliquam fermentum. In hac habitasse
                platea dictumst. Ut nisl nisi, sodales sit amet semper vitae, tincidunt accumsan libero. Suspendisse
                ullamcorper vel nibh eu sollicitudin. Nunc non iaculis elit. Quisque facilisis viverra massa vitae
                vestibulum. Pellentesque leo purus, tempus sed imperdiet at, sodales auctor mi.
            </BodyLong>
        </div>
    )
}
