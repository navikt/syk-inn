import React, { ReactElement, startTransition } from 'react'
import { useApolloClient } from '@apollo/client/react'
import { Button, Checkbox, CheckboxGroup } from '@navikt/ds-react'

import { DevToolItem } from '../InternalDevToolItem'

import { useAPIOverride } from './useAPIOverride'
import { ToggleableQueries } from './toggleable-queries'

export function ToggleAPIFailures(): ReactElement {
    const client = useApolloClient()
    const { queryOverrides, setQueryOverrides } = useAPIOverride()

    const queries: Record<ToggleableQueries, ReactElement> = {
        Behandler: (
            <Checkbox key="behandler" value="Behandler">
                Behandler
            </Checkbox>
        ),
        Pasient: (
            <Checkbox key="pasient" value="Pasient">
                Pasient
            </Checkbox>
        ),
        PasientWithExists: (
            <Checkbox key="pasient-with-exists" value="PasientWithExists">
                Pasient med oppslag i PDL
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
        AllDashboard: (
            <Checkbox key="allDashboard" value="AllDashboard">
                Alle sykmeldinger og utkast på dashboardet
            </Checkbox>
        ),
        AllSykmeldinger: (
            <Checkbox key="allSykmeldinger" value="AllSykmeldinger">
                Alle sykmeldinger (både pågående og tidligere)
            </Checkbox>
        ),
        PersonByIdent: (
            <Checkbox key="person" value="PersonByIdent">
                Pasient by OID (fnr/dnr)
            </Checkbox>
        ),
        GetDraft: (
            <Checkbox key="getDraft" value="GetDraft">
                Hent utkast
            </Checkbox>
        ),
        GetAllDrafts: (
            <Checkbox key="getAllDrafts" value="GetAllDrafts">
                Hent alle utkast
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
        SaveDraft: (
            <Checkbox key="saveDraft" value="SaveDraft">
                Lagre utkast (Mutation)
            </Checkbox>
        ),
        DeleteDraft: (
            <Checkbox key="deleteDraft" value="DeleteDraft">
                Slett utkast (Mutation)
            </Checkbox>
        ),
        Arbeidsforhold: (
            <Checkbox key="arbeidsforhold" value="Arbeidsforhold">
                Arbeidsforhold (Aareg)
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
