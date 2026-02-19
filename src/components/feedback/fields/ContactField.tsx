import React, { ReactElement } from 'react'
import { Select, TextField } from '@navikt/ds-react'
import { useController } from 'react-hook-form'
import { AnimatePresence } from 'motion/react'

import { SimpleReveal } from '@components/animation/Reveal'

import { FeedbackFormValues } from '../full-feedback/form'

/**
 * Psuedo feature toggle for phone contact field.
 */
const PHONE_CONTACT_ENABLED = false

export function ContactField(): ReactElement {
    const type = useController<FeedbackFormValues, 'contact.type'>({
        name: 'contact.type',
    })

    return (
        <div>
            <Select {...type.field} label="Ønsker du å bli kontaktet?" className="mb-4">
                <option value="NONE">Nei takk</option>
                <option value="EMAIL">Ja, via epost</option>
                {PHONE_CONTACT_ENABLED && <option value="PHONE">Ja, via telefon</option>}
            </Select>
            <AnimatePresence>
                {type.field.value === 'EMAIL' && (
                    <SimpleReveal>
                        <EmailField />
                    </SimpleReveal>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {type.field.value === 'PHONE' && (
                    <SimpleReveal>
                        <PhoneField />
                    </SimpleReveal>
                )}
            </AnimatePresence>
        </div>
    )
}

function EmailField(): ReactElement {
    const type = useController<FeedbackFormValues, 'contact.email'>({
        name: 'contact.email',
        rules: {
            required: 'Dersom du vil bli kontaktet via epost må du fortelle oss hvilken epost du vil bli kontaktet på',
        },
    })

    return (
        <TextField
            label="Epost vi kan kontakte deg på"
            {...type.field}
            value={type.field.value ?? ''}
            error={type.fieldState.error?.message}
        />
    )
}

function PhoneField(): ReactElement {
    const type = useController<FeedbackFormValues, 'contact.phone'>({
        name: 'contact.phone',
        rules: {
            required:
                'Dersom du vil bli kontaktet via telefon må du fortelle oss hvilket telefonnummer du vil bli kontaktet på',
        },
    })

    return (
        <TextField
            label="Telefonnummer vi kan kontakte deg på (ikke sentralbord)"
            {...type.field}
            value={type.field.value ?? ''}
            error={type.fieldState.error?.message}
        />
    )
}
