import React, { ReactElement } from 'react'

import { AnnenFravarsgrunnField } from './AnnenFravarsgrunnField'
import { AndreSporsmalField } from './AndreSporsmalField'

function AndreSporsmalSection(): ReactElement {
    return (
        <div>
            <AnnenFravarsgrunnField />
            <AndreSporsmalField />
        </div>
    )
}

export default AndreSporsmalSection
