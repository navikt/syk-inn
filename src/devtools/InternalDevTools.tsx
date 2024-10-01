import React, { ReactElement } from 'react'
import { Button, Heading, ToggleGroup } from '@navikt/ds-react'
import { PersonIcon, StethoscopeIcon } from '@navikt/aksel-icons'

import { DevToolItem } from './InternalDevToolItem'
import { DevToolsProps } from './DevTools'

export function InternalDevToolsPanel({ mode }: Pick<DevToolsProps, 'mode'>): ReactElement {
    return (
        <div className="h-[500px] max-h-[500px] overflow-auto bg-white border-t-2 p-2">
            <Heading level="3" size="medium" spacing>
                syk-inn devtools
            </Heading>
            <ResetSmartContext />
            <ToggleAppVariant mode={mode} />
        </div>
    )
}

function ResetSmartContext(): ReactElement {
    const resetSmartContext = (postAction?: 'reload' | 're-launch') => () => {
        const key = sessionStorage.getItem('SMART_KEY')
        if (key == null) return

        sessionStorage.removeItem(key)
        sessionStorage.removeItem('SMART_KEY')

        if (postAction === 'reload') window.location.reload()
        if (postAction === 're-launch') window.location.href = '/fhir/launch?iss=http://localhost:3000/api/fhir-mock'
    }

    return (
        <DevToolItem
            title="Reset SMART Context"
            description={`Deletes all SMART context from sessionStorage. Current SMART_KEY: ${sessionStorage?.getItem('SMART_KEY') ?? 'none'}`}
        >
            <Button variant="secondary-neutral" size="small" onClick={resetSmartContext()}>
                Reset
            </Button>
            <Button variant="secondary-neutral" size="small" onClick={resetSmartContext('reload')}>
                Reset and reload
            </Button>
            <Button variant="secondary-neutral" size="small" onClick={resetSmartContext('re-launch')}>
                Reset and re-launch
            </Button>
        </DevToolItem>
    )
}

function ToggleAppVariant({ mode }: Pick<DevToolsProps, 'mode'>): ReactElement {
    return (
        <DevToolItem
            title="Change app context"
            description="Toggle between rendering the app in FHIR-mode or standalone-mode"
        >
            <ToggleGroup
                defaultValue={mode}
                onChange={(value) => {
                    document.cookie = `development-mode-override=${value}; path=/`
                    window.location.reload()
                }}
            >
                <ToggleGroup.Item value="standalone" icon={<PersonIcon aria-hidden />} label="Standalone" />
                <ToggleGroup.Item value="fhir" icon={<StethoscopeIcon aria-hidden />} label="FHIR" />
            </ToggleGroup>
        </DevToolItem>
    )
}
