import dynamic from 'next/dynamic'
import React, { ReactElement } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { FormDraftSync } from './draft/FormDraftSync'
import { NySykmeldingMainFormValues } from './form/types'
import { type NySykmeldingFormVariantType } from './useFormVariant'
import BehandlingdagerSykmeldingForm from './variants/behandlingsdager/BehandlingdagerSykmeldingForm'
import { AllFormVariantsProps } from './variants/form-props'
import { NormalSykmeldigForm, NormalSykmeldingFormProps } from './variants/normal/NormalSykmelding'

const FormDevTools = dynamic(() => import('#dev/tools/NySykmeldingFormDevTools'), { ssr: false })

type NySykmeldingFormProps = AllFormVariantsProps &
    NormalSykmeldingFormProps & {
        variant: NySykmeldingFormVariantType
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
 *  - Select the correct 'variant' of the form based on the query parameter
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
                {variant === 'BEHANDLINGSDAGER' && (
                    <BehandlingdagerSykmeldingForm initialFom={initialFom} contextualErrors={contextualErrors} />
                )}
            </FormDraftSync>
            <FormDevTools />
        </FormProvider>
    )
}

export default NySykmeldingFormVariants
