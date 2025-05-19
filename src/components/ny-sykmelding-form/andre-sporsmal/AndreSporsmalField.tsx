import React, { ReactElement } from 'react'
import { Checkbox, CheckboxGroup } from '@navikt/ds-react'

import { useController } from '../form'

function AndreSporsmalField(): ReactElement {
    const andreSporsmal = useController({
        name: 'andreSporsmal',
    })

    return (
        <>
            <CheckboxGroup
                legend="Andre spørsmål relatert til sykmeldingen"
                hideLegend
                onChange={andreSporsmal.field.onChange}
                value={andreSporsmal.field.value}
            >
                <Checkbox value="svangerskapsrelatert">Sykdommen er svangerskapsrelatert</Checkbox>
                <Checkbox value="yrkesskade">Sykmeldingen kan skyldes en yrkesskade/yrkessykdom</Checkbox>
            </CheckboxGroup>
        </>
    )
}

export default AndreSporsmalField
