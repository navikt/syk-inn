import * as R from 'remeda'
import React, { ReactElement, startTransition } from 'react'
import { BodyShort, Button, Checkbox, CheckboxGroup, Heading, Link, List } from '@navikt/ds-react'
import { XMarkIcon } from '@navikt/aksel-icons'
import { useApolloClient } from '@apollo/client/react'

import { pathWithBasePath } from '@lib/url'

import { scenarios } from '../mock-engine/scenarios/scenarios'

import { DevToolItem } from './InternalDevToolItem'
import { useFeatureToggleOverride } from './useFeatureToggleOverride'
import { togglesChangedAction, deleteRequestAccessCookie } from './InternalDevToolsAction'
import { ToggleAPIFailures } from './api-fail-toggle/ToggleAPIFailures'

type Props = { onClose: () => void }

export function InternalDevToolsPanel({ onClose }: Props): ReactElement {
    return (
        <div className="w-[500px] max-w-[500px] h-full overflow-auto p-2 border-l-2 border-l-ax-border-brand-blue bg-ax-bg-brand-blue-soft">
            <Heading level="3" size="medium">
                App DevTools
            </Heading>
            <Button
                data-color="neutral"
                variant="tertiary"
                icon={<XMarkIcon title="Lukk DevTools" />}
                onClick={onClose}
                className="absolute right-2 top-2"
            />
            <BodyShort size="small" className="text-ax-text-neutral-subtle">
                Collection of actions and utilities used for local development only.
            </BodyShort>
            <div className="grid grid-cols-1 gap-6 mt-6">
                <ScenarioPicker />
                <OtherStuff />
                <FeatureToggles />
                <ToggleAPIFailures />
            </div>
        </div>
    )
}

function ScenarioPicker(): ReactElement {
    return (
        <DevToolItem title="Scenarios" description="Pre-load your session with different scenarios">
            <List className="my-4">
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

function OtherStuff(): ReactElement {
    const client = useApolloClient()

    return (
        <DevToolItem title="Other stuff" description="Miscellaneous dev actions">
            <Button
                data-color="neutral"
                variant="secondary"
                size="small"
                onClick={async () => {
                    await deleteRequestAccessCookie()

                    await client.refetchQueries({
                        include: 'all',
                    })
                }}
            >
                Delete access to all sykmeldinger
            </Button>
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
                            <span className="text-ax-text-neutral-subtle">(overridden)</span>
                        )}
                    </Checkbox>
                ))}
            </CheckboxGroup>
            <div className="mt-4 flex gap-3">
                <Button
                    data-color="neutral"
                    variant="secondary"
                    size="small"
                    onClick={resetOverrides}
                    disabled={overriddenToggles.length === 0}
                >
                    Clear all overrides
                </Button>
                <Button
                    data-color="neutral"
                    variant="secondary"
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
