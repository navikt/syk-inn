import { Select, Textarea } from '@navikt/ds-react'
import React, { ReactElement } from 'react'

import { useController } from '@components/ny-sykmelding-form/form'

function TilbakedateringGrunn(): ReactElement {
    const grunn = useController({
        name: 'tilbakedatering.grunn' as const,
        rules: {
            validate: (value) => {
                if (value == null) return `Du må velge grunn for tilbakedatering`
            },
        },
    })

    const annenBegrunnelse = useController({
        name: 'tilbakedatering.annenBegrunnelse' as const,
        rules: {
            validate: (value) => {
                if (grunn.field.value === 'ANNET' && (!value || value.trim() === '')) {
                    return 'Du må fylle inn annen årsak for tilbakedatering'
                }
            },
        },
    })

    return (
        <>
            <Select
                className="max-w-prose"
                label="Oppgi årsak for tilbakedatering"
                onChange={grunn.field.onChange}
                value={grunn.field.value ?? ''}
                error={grunn.fieldState.error?.message}
            >
                <option value="" disabled>
                    Velg årsak
                </option>
                <option value="VENTETID_LEGETIME">Ventetid på legetime</option>
                <option value="MANGLENDE_SYKDOMSINNSIKT_GRUNNET_ALVORLIG_PSYKISK_SYKDOM">
                    Manglende sykdomsinnsikt på grunn av alvorlig psykisk sykdom
                </option>
                <option value="ANNET">Annen årsak</option>
            </Select>
            {grunn.field.value === 'ANNET' && (
                <Textarea
                    label="Beskriv nærmere"
                    onChange={annenBegrunnelse.field.onChange}
                    value={annenBegrunnelse.field.value ?? ''}
                    error={annenBegrunnelse.fieldState.error?.message}
                />
            )}
        </>
    )
}

export default TilbakedateringGrunn
