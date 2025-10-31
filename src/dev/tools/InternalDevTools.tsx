import * as R from 'remeda'
import React, { ReactElement, startTransition } from 'react'
import { BodyShort, Button, Checkbox, CheckboxGroup, Heading, Link, List } from '@navikt/ds-react'
import { XMarkIcon } from '@navikt/aksel-icons'

import { pathWithBasePath } from '@lib/url'

import { scenarios } from '../mock-engine/scenarios/scenarios'

import { DevToolItem } from './InternalDevToolItem'
import { useFeatureToggleOverride } from './useFeatureToggleOverride'
import { togglesChangedAction } from './InternalDevToolsAction'
import { ToggleAPIFailures } from './api-fail-toggle/ToggleAPIFailures'

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
                <ScenarioPicker />
                <FeatureToggles />
                <ToggleAPIFailures />
            </div>
        </div>
    )
}

function ScenarioPicker(): ReactElement {
    return (
        <DevToolItem title="Scenarios" description="Pre-load your session with different scenarios">
            <List as="ul">
                {R.entries(scenarios).map(([key, scenario]) => (
                    <List.Item key={key}>
                        <Link href={pathWithBasePath(`/dev/set-scenario/${key}?returnTo=/fhir`)}>
                            {scenario.description}
                        </Link>
                    </List.Item>
                ))}
            </List>
        </DevToolItem>
    )
}

function FeatureToggles(): ReactElement {
    const { toggles, toggledToggles, setToggledToggles, overriddenToggles, resetOverrides } = useFeatureToggleOverride()

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
                        {toggle.name}{' '}
                        {overriddenToggles.includes(toggle.name) && (
                            <span className="text-text-subtle">(overridden)</span>
                        )}
                    </Checkbox>
                ))}
            </CheckboxGroup>

            <div className="mt-4 flex gap-3">
                <Button
                    variant="secondary-neutral"
                    size="small"
                    onClick={resetOverrides}
                    disabled={overriddenToggles.length === 0}
                >
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
