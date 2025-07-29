import { Select, TextField } from '@navikt/ds-react'
import React, { ReactElement } from 'react'

import { useController } from '../form'

function TilbakedateringGrunn(): ReactElement {
    const grunn = useController({
        name: 'tilbakedatering.grunn' as const,
        rules: {
            validate: (value) => {
                if (value == null)
                    return `Hvis du tilbakedaterer sykmeldingen mer enn fire dager, må du begrunne hvorfor.`
            },
        },
    })
    const annenGrunn = useController({
        name: 'tilbakedatering.annenGrunn' as const,
        rules: {
            validate: (value) => {
                if (grunn.field.value === 'ANNET' && (!value || value.trim() === ''))
                    return `Du må oppgi annen grunn for tilbakedatering`
            },
        },
    })

    return (
        <>
            <Select
                label="Velg årsak for tilbakedatering"
                onChange={grunn.field.onChange}
                value={grunn.field.value ?? ''}
                error={grunn.fieldState.error?.message}
            >
                <option value="" disabled>
                    Velg årsak
                </option>
                <option value="VENTETID_LEGETIME">Ventetid på legetime</option>
                <option value="MANGLENDE_SYKDOMSINNSIKT_GRUNNET_ALVORLIG_PSYKISK_SYKDOM">
                    Manglende sykdomsinnsikt grunnet alvorlig psykisk sykdom
                </option>
                <option value="ANNET">Annet</option>
            </Select>
            {grunn.field.value === 'ANNET' && (
                <TextField
                    className="max-w-prose"
                    label="Oppgi årsak for tilbakedatering"
                    onChange={annenGrunn.field.onChange}
                    value={annenGrunn.field.value ?? ''}
                    error={annenGrunn.fieldState.error?.message}
                />
            )}
        </>
    )
}

export default TilbakedateringGrunn
