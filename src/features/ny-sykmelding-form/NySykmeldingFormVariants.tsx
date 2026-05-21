import React, { ReactElement } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import dynamic from 'next/dynamic'

import { NormalSykmeldigForm, NormalSykmeldingFormProps } from './variants/normal/NormalSykmelding'
import { AllFormVariantsProps } from './variants/form-props'
import { NySykmeldingMainFormValues } from './form/types'
import { FormDraftSync } from './draft/FormDraftSync'

const FormDevTools = dynamic(() => import('@dev/tools/NySykmeldingFormDevTools'), { ssr: false })

type NySykmeldingFormProps = AllFormVariantsProps &
    NormalSykmeldingFormProps & {
        variant: 'NORMAL'
        /**
         * Any form rendered NEEDS to come provided with default values. The form can be rendered in different
         * contexts, some that care about existing values/drafts/suggestions differently. This should be controlled
         * by the parent.
         */
        defaultValues: NySykmeldingMainFormValues
    }

/**
 * The form root has two responsibilities:
 *  - Own the root form state and provide it
 *  - Select the correct 'variant' of the form
 */
function NySykmeldingFormVariants({
    variant,
    defaultValues,
    initialFom,
    context,
    contextualErrors,
}: NySykmeldingFormProps): ReactElement {
    const form = useForm<NySykmeldingMainFormValues>({
        defaultValues,
    })

    return (
        <FormProvider {...form}>
            <FormDraftSync>
                {variant === 'NORMAL' && (
                    <NormalSykmeldigForm
                        initialFom={initialFom}
                        context={context}
                        contextualErrors={contextualErrors}
                    />
                )}
            </FormDraftSync>
            <FormDevTools />
        </FormProvider>
    )
}

export default NySykmeldingFormVariants
