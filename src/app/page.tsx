import { Button } from '@navikt/ds-react'
import { VirusIcon } from '@navikt/aksel-icons'
import { ReactElement } from 'react'

export default function Home(): ReactElement {
    return (
        <div className="flex gap-3 p-3 flex-col">
            <div className="bg-red-500">HEY</div>
            <Button icon={<VirusIcon />}>They call me Aksel</Button>
        </div>
    )
}
