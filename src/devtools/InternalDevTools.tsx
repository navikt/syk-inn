import React, { ReactElement, startTransition } from 'react'
import { BodyShort, Button, Checkbox, CheckboxGroup, Heading, ToggleGroup } from '@navikt/ds-react'
import { PersonIcon, StethoscopeIcon } from '@navikt/aksel-icons'

import { getAbsoluteURL, urlWithBasePath } from '@utils/url'

import { DevToolItem } from './InternalDevToolItem'
import { DevToolsProps } from './DevTools'
import { useAPIOverride } from './useAPIOverride'

export function InternalDevToolsPanel({ mode }: Pick<DevToolsProps, 'mode'>): ReactElement {
    return (
        <div className="h-[500px] max-h-[500px] overflow-auto p-2 border-t-2 border-t-border-alt-3 bg-surface-alt-3-subtle">
            <Heading level="3" size="medium">
                App DevTools
            </Heading>
            <BodyShort size="small" className="text-text-subtle">
                Collection of actions and utilities used for local development only.
            </BodyShort>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                <ResetSmartContext />
                <ToggleAppVariant mode={mode} />
                <ToggleAPIFailures />
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
        if (postAction === 're-launch') {
            window.location.href = urlWithBasePath(`/fhir/launch?iss=${getAbsoluteURL()}/api/fhir-mock`)
        }
    }

    return (
        <DevToolItem
            title="Reset SMART Context"
            description={`Deletes all SMART context from sessionStorage. Current SMART_KEY: ${sessionStorage?.getItem('SMART_KEY') ?? 'none'}`}
            className="flex gap-3"
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

function ToggleAPIFailures(): ReactElement {
    const { queryOverrides, setQueryOverrides, contextOverrides, setContextOverrides } = useAPIOverride()

    return (
        <DevToolItem
            title="Force API errors"
            description="Toggle specific APIs to fail for testing graceful degredation of components"
            className="flex flex-col gap-3"
        >
            <CheckboxGroup
                legend="Context"
                description="Contextual APIs are based on SMART context or standalone preloading"
                value={contextOverrides}
                size="small"
                onChange={(value) => {
                    startTransition(() => {
                        setContextOverrides(value)
                    })
                }}
            >
                <Checkbox value="pasient">Pasient</Checkbox>
            </CheckboxGroup>
            <CheckboxGroup
                legend="Query"
                description="Query APIs are based on user input or external data sources"
                value={queryOverrides}
                size="small"
                onChange={(value) => {
                    startTransition(() => {
                        setQueryOverrides(value)
                    })
                }}
            >
                <Checkbox value="pasient">Pasient by OID</Checkbox>
            </CheckboxGroup>
        </DevToolItem>
    )
}
