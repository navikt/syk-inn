import React, { ReactElement, startTransition } from 'react'
import { useApolloClient } from '@apollo/client'
import { Button, Checkbox, CheckboxGroup } from '@navikt/ds-react'

import { DevToolItem } from '../InternalDevToolItem'

import { useAPIOverride } from './useAPIOverride'
import { ToggleableQueries } from './toggleable-queries'

export function ToggleAPIFailures(): ReactElement {
    const client = useApolloClient()
    const { queryOverrides, setQueryOverrides } = useAPIOverride()

    const queries: Record<ToggleableQueries, ReactElement> = {
        Pasient: (
            <Checkbox key="pasient" value="Pasient">
                Pasient
            </Checkbox>
        ),
        Konsultasjon: (
            <Checkbox key="konsultasjon" value="Konsultasjon">
                Konsultasjon
            </Checkbox>
        ),
        DiagnoseSearch: (
            <Checkbox key="diagnose" value="DiagnoseSearch">
                Diagnose-søk
            </Checkbox>
        ),
        SykmeldingById: (
            <Checkbox key="sykmelding" value="SykmeldingById">
                Sykmelding
            </Checkbox>
        ),
        PersonByIdent: (
            <Checkbox key="person" value="PersonByIdent">
                Pasient by OID (fnr/dnr)
            </Checkbox>
        ),
        OpprettSykmelding: (
            <Checkbox key="opprettSykmelding" value="OpprettSykmelding">
                Opprett sykmelding (Mutation)
            </Checkbox>
        ),
        SynchronizeSykmelding: (
            <Checkbox key="synchronizeSykmelding" value="SynchronizeSykmelding">
                Sykmelding-synkronisering (Mutation)
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
                description="GraphQL query overrides"
                value={queryOverrides}
                size="small"
                onChange={(value) => {
                    startTransition(() => {
                        setQueryOverrides(value)
                    })
                }}
            >
                {...Object.values(queries)}
            </CheckboxGroup>
            <div>
                <Button
                    variant="secondary-neutral"
                    size="small"
                    onClick={async () => {
                        await client.refetchQueries({
                            include: 'all',
                        })
                    }}
                >
                    Reload all queries
                </Button>
            </div>
        </DevToolItem>
    )
}
