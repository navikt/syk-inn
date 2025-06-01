import React, { ReactElement, startTransition } from 'react'
import { Button, Checkbox, CheckboxGroup } from '@navikt/ds-react'
import { useQueryClient } from '@tanstack/react-query'

import { DataService } from '@data-layer/data-fetcher/data-service'

import { DevToolItem } from '../InternalDevToolItem'

import { useAPIOverride } from './useAPIOverride'

export function ToggleAPIFailures(): ReactElement {
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
