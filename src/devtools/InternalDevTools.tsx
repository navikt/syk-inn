import React, { ReactElement } from 'react'
import { BodyShort, Button, Heading, ToggleGroup } from '@navikt/ds-react'
import { PersonIcon, StethoscopeIcon } from '@navikt/aksel-icons'

import { getBaseURL } from '@utils/url'

import { DevToolItem } from './InternalDevToolItem'
import { DevToolsProps } from './DevTools'

export function InternalDevToolsPanel({ mode }: Pick<DevToolsProps, 'mode'>): ReactElement {
    return (
        <div className="h-[500px] max-h-[500px] overflow-auto p-2 border-t-2 border-t-border-alt-3 bg-surface-alt-3-subtle">
            <Heading level="3" size="medium">
                App DevTools
            </Heading>
            <BodyShort size="small" className="text-text-subtle">
                Collection of actions and utilities used for local development only.
            </BodyShort>
            <div className="flex flex-col gap-6 mt-6">
                <ResetSmartContext />
                <ToggleAppVariant mode={mode} />
            </div>
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
        if (postAction === 're-launch') window.location.href = `/fhir/launch?iss=${getBaseURL()}/api/fhir-mock`
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
                variant="neutral"
            >
                <ToggleGroup.Item value="standalone" icon={<PersonIcon aria-hidden />} label="Standalone" />
                <ToggleGroup.Item value="fhir" icon={<StethoscopeIcon aria-hidden />} label="FHIR" />
            </ToggleGroup>
        </DevToolItem>
    )
}
