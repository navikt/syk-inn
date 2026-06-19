import React, { ReactElement } from 'react'

import { AndreSporsmalField } from './AndreSporsmalField'
import { AnnenFravarsgrunnField } from './AnnenFravarsgrunnField'

function AndreSporsmalSection(): ReactElement {
    return (
        <div>
            <AnnenFravarsgrunnField />
            <AndreSporsmalField />
        </div>
    )
}

export default AndreSporsmalSection
