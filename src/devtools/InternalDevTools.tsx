import React, { ReactElement, startTransition } from 'react'
import { BodyShort, Button, Checkbox, CheckboxGroup, Detail, Heading, ToggleGroup } from '@navikt/ds-react'
import { PersonIcon, StethoscopeIcon, XMarkIcon } from '@navikt/aksel-icons'
import { useQueryClient } from '@tanstack/react-query'

import { getAbsoluteURL, pathWithBasePath } from '@utils/url'
import { NySykmeldingFormDataService } from '@components/ny-sykmelding-form/data-provider/NySykmeldingFormDataService'

import { DevToolItem } from './InternalDevToolItem'
import { DevToolsProps } from './DevTools'
import { useAPIOverride } from './useAPIOverride'

export function InternalDevToolsPanel({
    mode,
    onClose,
}: Pick<DevToolsProps, 'mode'> & { onClose: () => void }): ReactElement {
    return (
        <div className="w-[500px] max-w-[500px] h-full overflow-auto p-2 border-l-2 border-l-border-alt-3 bg-surface-alt-3-subtle">
            <Heading level="3" size="medium">
                App DevTools
            </Heading>
            <Button
                variant="tertiary-neutral"
                icon={<XMarkIcon title="Lukk DevTools" />}
                onClick={onClose}
                className="absolute right-2 top-2"
            />
            <BodyShort size="small" className="text-text-subtle">
                Collection of actions and utilities used for local development only.
            </BodyShort>
            <div className="grid grid-cols-1 gap-6 mt-6">
                <ToggleAPIFailures />
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
        if (postAction === 're-launch') {
            window.location.href = pathWithBasePath(`/fhir/launch?iss=${getAbsoluteURL()}/api/fhir-mock`)
        }
    }

    return (
        <DevToolItem
            title="SMART Context"
            description="Utilities for interacting with SMART stuff"
            className="flex flex-col gap-3"
        >
            <div>
                <Detail>Deletes all SMART context from sessionStorage.</Detail>
                <Detail spacing>Current SMART_KEY: {sessionStorage?.getItem('SMART_KEY') ?? 'none'}</Detail>
                <div className="flex gap-3">
                    <Button variant="secondary-neutral" size="small" onClick={resetSmartContext()}>
                        Reset
                    </Button>
                    <Button variant="secondary-neutral" size="small" onClick={resetSmartContext('reload')}>
                        Reset and reload
                    </Button>
                    <Button variant="secondary-neutral" size="small" onClick={resetSmartContext('re-launch')}>
                        Reset and re-launch
                    </Button>
                </div>
            </div>
            <div>
                <Detail>Test auth stuff</Detail>
                <Button
                    size="small"
                    variant="secondary-neutral"
                    onClick={async () => {
                        const key = JSON.parse(sessionStorage.getItem('SMART_KEY')!)
                        const item = JSON.parse(sessionStorage.getItem(key)!)
                        const accessToken = item.tokenResponse.access_token

                        await fetch(pathWithBasePath('/api/test'), {
                            headers: {
                                Authorization: `Bearer ${accessToken}`,
                            },
                        })
                    }}
                >
                    Validate current access token
                </Button>
                <Detail>(See server log for result)</Detail>
            </div>
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
    const queryClient = useQueryClient()
    const { queryOverrides, setQueryOverrides, contextOverrides, setContextOverrides } = useAPIOverride()

    const context: Record<keyof NySykmeldingFormDataService['context'], ReactElement> = {
        pasient: (
            <Checkbox key="pasient" value="pasient">
                Pasient
            </Checkbox>
        ),
        arbeidsgivere: (
            <Checkbox key="arbeidsgivere" value="arbeidsgivere">
                Arbeidsgivere
            </Checkbox>
        ),
        bruker: (
            <Checkbox key="bruker" value="bruker">
                Bruker
            </Checkbox>
        ),
    }

    const query: Record<keyof NySykmeldingFormDataService['query'], ReactElement> = {
        pasient: (
            <Checkbox key="pasient" value="pasient">
                Pasient by OID (fnr/dnr)
            </Checkbox>
        ),
    }

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
                {...Object.values(context)}
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
                {...Object.values(query)}
            </CheckboxGroup>
            <div>
                <Button
                    variant="secondary-neutral"
                    size="small"
                    onClick={() => {
                        queryClient.resetQueries()
                    }}
                >
                    Reload all queries
                </Button>
            </div>
        </DevToolItem>
    )
}
