import React, { ReactElement } from 'react'
import { ArrowLeftIcon, ArrowRightIcon, PersonIcon } from '@navikt/aksel-icons'
import { Button } from '@navikt/ds-react'

import { FormSection } from '@components/ui/form'
import PasientSection from '@components/ny-sykmelding-form-multi-step/pasient/PasientSection'
import { StepSection, useFormStep } from '@components/ny-sykmelding-form-multi-step/useFormStep'

function FormSteps(): ReactElement {
    const [step] = useFormStep()

    return (
        <div className="max-w-prose">
            {step}
            <Sections section={step} />
            <div className="flex gap-3 mt-8">
                <Button type="button" variant="secondary" icon={<ArrowLeftIcon aria-hidden />} iconPosition="left">
                    Forrige steg
                </Button>
                <Button type="submit" variant="primary" icon={<ArrowRightIcon aria-hidden />} iconPosition="right">
                    Neste steg
                </Button>
            </div>
        </div>
    )
}

function Sections({ section }: { section: StepSection }): ReactElement {
    switch (section) {
        case 1:
            return (
                <FormSection title="Info om pasienten" icon={<PersonIcon />}>
                    <PasientSection />
                </FormSection>
            )
        case 2:
            return <div>TODO 2</div>
        case 3:
            return <div>TODO 3</div>
        case 4:
            return <div>TODO 4</div>
        case 5:
            return <div>TODO 5</div>
    }
}

export default FormSteps
