import React, { ReactElement, startTransition } from 'react'
import { BodyShort, Button, Checkbox, CheckboxGroup, Heading } from '@navikt/ds-react'
import { XMarkIcon } from '@navikt/aksel-icons'
import { useQueryClient } from '@tanstack/react-query'

import { DataService } from '@data-layer/data-fetcher/data-service'

import { DevToolItem } from './InternalDevToolItem'
import { useAPIOverride } from './useAPIOverride'
import { useFeatureToggleOverride } from './useFeatureToggleOverride'
import { togglesChangedAction } from './InternalDevToolsAction'

type Props = { onClose: () => void }

export function InternalDevToolsPanel({ onClose }: Props): ReactElement {
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
                <FeatureToggles />
                <ToggleAPIFailures />
            </div>
        </div>
    )
}

function FeatureToggles(): ReactElement {
    const { toggles, toggledToggles, setToggledToggles, resetOverrides } = useFeatureToggleOverride()

    return (
        <DevToolItem title="Feature toggles" description="Overwrite feature toggles">
            <CheckboxGroup
                legend="Enabled toggles"
                value={toggledToggles}
                size="small"
                onChange={(values) => {
                    setToggledToggles(values)
                }}
            >
                {toggles.map((toggle) => (
                    <Checkbox key={toggle.name} value={toggle.name}>
                        {toggle.name}
                    </Checkbox>
                ))}
            </CheckboxGroup>

            <div className="mt-4 flex gap-3">
                <Button variant="secondary-neutral" size="small" onClick={resetOverrides}>
                    Clear all overrides
                </Button>
                <Button
                    variant="secondary-neutral"
                    size="small"
                    onClick={() => {
                        startTransition(async () => {
                            await togglesChangedAction()
                        })
                    }}
                >
                    Apply changed toggles
                </Button>
            </div>
        </DevToolItem>
    )
}

function ToggleAPIFailures(): ReactElement {
    const queryClient = useQueryClient()
    const { queryOverrides, setQueryOverrides, contextOverrides, setContextOverrides } = useAPIOverride()

    const context: Record<keyof DataService['context'], ReactElement> = {
        pasient: (
            <Checkbox key="pasient" value="pasient">
                Pasient
            </Checkbox>
        ),
        konsultasjon: (
            <Checkbox key="konsultasjon" value="konsultasjon">
                Konsultasjon
            </Checkbox>
        ),
        behandler: (
            <Checkbox key="bruker" value="bruker">
                Bruker
            </Checkbox>
        ),
    }

    const query: Record<keyof DataService['query'], ReactElement> = {
        sykmelding: (
            <Checkbox key="sykmelding" value="sykmelding">
                Sykmelding
            </Checkbox>
        ),
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
