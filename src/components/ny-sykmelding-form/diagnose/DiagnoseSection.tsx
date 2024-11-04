import React, { ReactElement } from 'react'
import { Detail } from '@navikt/ds-react'

import DiagnoseSmartPicker from '@components/ny-sykmelding-form/diagnose/DiagnoseSmartPicker'

function DiagnoseSection(): ReactElement {
    return (
        <div>
            <Detail spacing>Pasientens medisinske diagnose. Søket søker i både ICPC-2 og ICD-10 diagnosekoder.</Detail>
            <DiagnoseSmartPicker />
        </div>
    )
}

export default DiagnoseSection
