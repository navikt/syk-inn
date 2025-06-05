/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core'
export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> }
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> }
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never }
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never }
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
    ID: { input: string; output: string }
    String: { input: string; output: string }
    Boolean: { input: boolean; output: boolean }
    Int: { input: number; output: number }
    Float: { input: number; output: number }
    DateOnly: { input: any; output: any }
    JSON: { input: unknown; output: unknown }
}

export type Aktivitet = AktivitetIkkeMulig | Avventende | Behandlingsdager | Gradert | Reisetilskudd

export type AktivitetIkkeMulig = FomTom & {
    __typename?: 'AktivitetIkkeMulig'
    fom: Scalars['DateOnly']['output']
    tom: Scalars['DateOnly']['output']
    type: AktivitetType
}

export type AktivitetType = 'AKTIVITET_IKKE_MULIG' | 'AVVENTENDE' | 'BEHANDLINGSDAGER' | 'GRADERT' | 'REISETILSKUDD'

export type Avventende = FomTom & {
    __typename?: 'Avventende'
    fom: Scalars['DateOnly']['output']
    innspillTilArbeidsgiver: Scalars['String']['output']
    tom: Scalars['DateOnly']['output']
    type: AktivitetType
}

export type Behandler = {
    __typename?: 'Behandler'
    hpr: Scalars['String']['output']
    navn: Scalars['String']['output']
}

export type Behandlingsdager = FomTom & {
    __typename?: 'Behandlingsdager'
    antallBehandlingsdager: Scalars['Int']['output']
    fom: Scalars['DateOnly']['output']
    tom: Scalars['DateOnly']['output']
    type: AktivitetType
}

export type Diagnose = {
    __typename?: 'Diagnose'
    code: Scalars['String']['output']
    system: DiagnoseSystem
    text: Scalars['String']['output']
}

export type DiagnoseSystem = 'ICD10' | 'ICPC2'

export type DocumentStatus = 'COMPLETE' | 'ERRORED' | 'PENDING'

export type FomTom = {
    fom: Scalars['DateOnly']['output']
    tom: Scalars['DateOnly']['output']
}

export type Gradert = FomTom & {
    __typename?: 'Gradert'
    fom: Scalars['DateOnly']['output']
    grad: Scalars['Int']['output']
    tom: Scalars['DateOnly']['output']
    type: AktivitetType
}

export type InputDiagnose = {
    code: Scalars['String']['input']
    system: DiagnoseSystem
}

export type InputPeriode = {
    fom: Scalars['String']['input']
    grad?: InputMaybe<Scalars['String']['input']>
    tom: Scalars['String']['input']
    type: Scalars['String']['input']
}

export type Konsultasjon = {
    __typename?: 'Konsultasjon'
    diagnoser?: Maybe<Array<Diagnose>>
}

export type Mutation = {
    __typename?: 'Mutation'
    deleteDraft: Scalars['Boolean']['output']
    opprettSykmelding: OpprettetSykmelding
    saveDraft: OpprettSykmeldingDraft
    synchronizeSykmelding: SynchronizationStatus
}

export type MutationDeleteDraftArgs = {
    draftId: Scalars['String']['input']
}

export type MutationOpprettSykmeldingArgs = {
    nySykmelding: OpprettSykmelding
}

export type MutationSaveDraftArgs = {
    draftId: Scalars['String']['input']
    values: Scalars['JSON']['input']
}

export type MutationSynchronizeSykmeldingArgs = {
    id: Scalars['String']['input']
}

export type OpprettSykmelding = {
    hoveddiagnose: InputDiagnose
    pasientIdent: Scalars['String']['input']
    perioder: Array<InputPeriode>
}

export type OpprettSykmeldingDraft = {
    __typename?: 'OpprettSykmeldingDraft'
    draftId: Scalars['String']['output']
    values: Scalars['JSON']['output']
}

export type OpprettetSykmelding = {
    __typename?: 'OpprettetSykmelding'
    sykmeldingId: Scalars['String']['output']
}

export type Pasient = Person & {
    __typename?: 'Pasient'
    ident: Scalars['String']['output']
    navn: Scalars['String']['output']
}

export type Person = {
    ident: Scalars['String']['output']
    navn: Scalars['String']['output']
}

export type QueriedPerson = Person & {
    __typename?: 'QueriedPerson'
    ident: Scalars['String']['output']
    navn: Scalars['String']['output']
}

export type Query = {
    __typename?: 'Query'
    behandler?: Maybe<Behandler>
    diagnose?: Maybe<Array<Diagnose>>
    draft?: Maybe<OpprettSykmeldingDraft>
    drafts?: Maybe<Array<OpprettSykmeldingDraft>>
    konsultasjon?: Maybe<Konsultasjon>
    pasient?: Maybe<Pasient>
    person?: Maybe<QueriedPerson>
    sykmelding?: Maybe<Sykmelding>
}

export type QueryDiagnoseArgs = {
    query: Scalars['String']['input']
}

export type QueryDraftArgs = {
    draftId: Scalars['String']['input']
}

export type QueryPersonArgs = {
    ident?: InputMaybe<Scalars['String']['input']>
}

export type QuerySykmeldingArgs = {
    id: Scalars['String']['input']
}

export type Reisetilskudd = FomTom & {
    __typename?: 'Reisetilskudd'
    fom: Scalars['DateOnly']['output']
    tom: Scalars['DateOnly']['output']
    type: AktivitetType
}

export type Sykmelding = {
    __typename?: 'Sykmelding'
    aktivitet: Aktivitet
    diagnose: SykmeldingDiagnoser
    documentStatus: DocumentStatus
    pasient: Pasient
    sykmeldingId: Scalars['String']['output']
}

export type SykmeldingDiagnoser = {
    __typename?: 'SykmeldingDiagnoser'
    bi: Array<Diagnose>
    hoved: Diagnose
}

export type SynchronizationStatus = {
    __typename?: 'SynchronizationStatus'
    documentStatus: DocumentStatus
    navStatus: DocumentStatus
}

type Person_Pasient_Fragment = { __typename?: 'Pasient'; ident: string; navn: string }

type Person_QueriedPerson_Fragment = { __typename?: 'QueriedPerson'; ident: string; navn: string }

export type PersonFragment = Person_Pasient_Fragment | Person_QueriedPerson_Fragment

export type DiagnoseSearchQueryVariables = Exact<{
    query: Scalars['String']['input']
}>

export type DiagnoseSearchQuery = {
    __typename?: 'Query'
    diagnose?: Array<{ __typename?: 'Diagnose'; system: DiagnoseSystem; code: string; text: string }> | null
}

export type DiagnoseFragment = { __typename?: 'Diagnose'; system: DiagnoseSystem; code: string; text: string }

export type SaveDraftMutationVariables = Exact<{
    draftId: Scalars['String']['input']
    values: Scalars['JSON']['input']
}>

export type SaveDraftMutation = {
    __typename?: 'Mutation'
    saveDraft: { __typename?: 'OpprettSykmeldingDraft'; draftId: string; values: unknown }
}

export type DeleteDraftMutationVariables = Exact<{
    draftId: Scalars['String']['input']
}>

export type DeleteDraftMutation = { __typename?: 'Mutation'; deleteDraft: boolean }

export type GetDraftQueryVariables = Exact<{
    draftId: Scalars['String']['input']
}>

export type GetDraftQuery = {
    __typename?: 'Query'
    draft?: { __typename?: 'OpprettSykmeldingDraft'; draftId: string; values: unknown } | null
}

export type GetAllDraftsQueryVariables = Exact<{ [key: string]: never }>

export type GetAllDraftsQuery = {
    __typename?: 'Query'
    drafts?: Array<{ __typename?: 'OpprettSykmeldingDraft'; draftId: string; values: unknown }> | null
}

export type KonsultasjonQueryVariables = Exact<{ [key: string]: never }>

export type KonsultasjonQuery = {
    __typename?: 'Query'
    konsultasjon?: {
        __typename?: 'Konsultasjon'
        diagnoser?: Array<{ __typename?: 'Diagnose'; system: DiagnoseSystem; code: string; text: string }> | null
    } | null
}

export type PasientQueryVariables = Exact<{ [key: string]: never }>

export type PasientQuery = {
    __typename?: 'Query'
    pasient?: { __typename?: 'Pasient'; ident: string; navn: string } | null
}

export type PersonByIdentQueryVariables = Exact<{
    ident?: InputMaybe<Scalars['String']['input']>
}>

export type PersonByIdentQuery = {
    __typename?: 'Query'
    person?: { __typename?: 'QueriedPerson'; ident: string; navn: string } | null
}

export type SykmeldingByIdQueryVariables = Exact<{
    id: Scalars['String']['input']
}>

export type SykmeldingByIdQuery = {
    __typename?: 'Query'
    sykmelding?: {
        __typename?: 'Sykmelding'
        sykmeldingId: string
        documentStatus: DocumentStatus
        pasient: { __typename?: 'Pasient'; navn: string; ident: string }
        diagnose: {
            __typename?: 'SykmeldingDiagnoser'
            hoved: { __typename?: 'Diagnose'; code: string; system: DiagnoseSystem; text: string }
        }
        aktivitet:
            | { __typename?: 'AktivitetIkkeMulig'; fom: any; tom: any; type: AktivitetType }
            | { __typename?: 'Avventende'; fom: any; tom: any; type: AktivitetType; innspillTilArbeidsgiver: string }
            | {
                  __typename?: 'Behandlingsdager'
                  fom: any
                  tom: any
                  type: AktivitetType
                  antallBehandlingsdager: number
              }
            | { __typename?: 'Gradert'; fom: any; tom: any; type: AktivitetType; grad: number }
            | { __typename?: 'Reisetilskudd'; fom: any; tom: any; type: AktivitetType }
    } | null
}

export type OpprettSykmeldingMutationVariables = Exact<{
    values: OpprettSykmelding
}>

export type OpprettSykmeldingMutation = {
    __typename?: 'Mutation'
    opprettSykmelding: { __typename?: 'OpprettetSykmelding'; sykmeldingId: string }
}

export type SykmeldingFragment = {
    __typename?: 'Sykmelding'
    sykmeldingId: string
    documentStatus: DocumentStatus
    pasient: { __typename?: 'Pasient'; navn: string; ident: string }
    diagnose: {
        __typename?: 'SykmeldingDiagnoser'
        hoved: { __typename?: 'Diagnose'; code: string; system: DiagnoseSystem; text: string }
    }
    aktivitet:
        | { __typename?: 'AktivitetIkkeMulig'; fom: any; tom: any; type: AktivitetType }
        | { __typename?: 'Avventende'; fom: any; tom: any; type: AktivitetType; innspillTilArbeidsgiver: string }
        | { __typename?: 'Behandlingsdager'; fom: any; tom: any; type: AktivitetType; antallBehandlingsdager: number }
        | { __typename?: 'Gradert'; fom: any; tom: any; type: AktivitetType; grad: number }
        | { __typename?: 'Reisetilskudd'; fom: any; tom: any; type: AktivitetType }
}

type Aktivitet_AktivitetIkkeMulig_Fragment = {
    __typename?: 'AktivitetIkkeMulig'
    fom: any
    tom: any
    type: AktivitetType
}

type Aktivitet_Avventende_Fragment = {
    __typename?: 'Avventende'
    fom: any
    tom: any
    type: AktivitetType
    innspillTilArbeidsgiver: string
}

type Aktivitet_Behandlingsdager_Fragment = {
    __typename?: 'Behandlingsdager'
    fom: any
    tom: any
    type: AktivitetType
    antallBehandlingsdager: number
}

type Aktivitet_Gradert_Fragment = { __typename?: 'Gradert'; fom: any; tom: any; type: AktivitetType; grad: number }

type Aktivitet_Reisetilskudd_Fragment = { __typename?: 'Reisetilskudd'; fom: any; tom: any; type: AktivitetType }

export type AktivitetFragment =
    | Aktivitet_AktivitetIkkeMulig_Fragment
    | Aktivitet_Avventende_Fragment
    | Aktivitet_Behandlingsdager_Fragment
    | Aktivitet_Gradert_Fragment
    | Aktivitet_Reisetilskudd_Fragment

export type SynchronizeSykmeldingMutationVariables = Exact<{
    id: Scalars['String']['input']
}>

export type SynchronizeSykmeldingMutation = {
    __typename?: 'Mutation'
    synchronizeSykmelding: {
        __typename?: 'SynchronizationStatus'
        documentStatus: DocumentStatus
        navStatus: DocumentStatus
    }
}

export const PersonFragmentDoc = {
    kind: 'Document',
    definitions: [
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'Person' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Person' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'ident' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'navn' } },
                ],
            },
        },
    ],
} as unknown as DocumentNode<PersonFragment, unknown>
export const DiagnoseFragmentDoc = {
    kind: 'Document',
    definitions: [
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'Diagnose' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Diagnose' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'system' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'code' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'text' } },
                ],
            },
        },
    ],
} as unknown as DocumentNode<DiagnoseFragment, unknown>
export const AktivitetFragmentDoc = {
    kind: 'Document',
    definitions: [
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'Aktivitet' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Aktivitet' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'FomTom' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'fom' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'tom' } },
                            ],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AktivitetIkkeMulig' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [{ kind: 'Field', name: { kind: 'Name', value: 'type' } }],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Avventende' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'innspillTilArbeidsgiver' } },
                            ],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Behandlingsdager' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'antallBehandlingsdager' } },
                            ],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Gradert' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'grad' } },
                            ],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Reisetilskudd' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [{ kind: 'Field', name: { kind: 'Name', value: 'type' } }],
                        },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<AktivitetFragment, unknown>
export const SykmeldingFragmentDoc = {
    kind: 'Document',
    definitions: [
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'Sykmelding' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Sykmelding' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'sykmeldingId' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'pasient' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'navn' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'ident' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'diagnose' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'hoved' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'code' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'system' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'text' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'aktivitet' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'Aktivitet' } }],
                        },
                    },
                    { kind: 'Field', name: { kind: 'Name', value: 'documentStatus' } },
                ],
            },
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'Aktivitet' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Aktivitet' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'FomTom' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'fom' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'tom' } },
                            ],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AktivitetIkkeMulig' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [{ kind: 'Field', name: { kind: 'Name', value: 'type' } }],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Avventende' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'innspillTilArbeidsgiver' } },
                            ],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Behandlingsdager' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'antallBehandlingsdager' } },
                            ],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Gradert' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'grad' } },
                            ],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Reisetilskudd' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [{ kind: 'Field', name: { kind: 'Name', value: 'type' } }],
                        },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<SykmeldingFragment, unknown>
export const DiagnoseSearchDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'query',
            name: { kind: 'Name', value: 'DiagnoseSearch' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'query' } },
                    type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'diagnose' },
                        arguments: [
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'query' },
                                value: { kind: 'Variable', name: { kind: 'Name', value: 'query' } },
                            },
                        ],
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'Diagnose' } }],
                        },
                    },
                ],
            },
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'Diagnose' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Diagnose' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'system' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'code' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'text' } },
                ],
            },
        },
    ],
} as unknown as DocumentNode<DiagnoseSearchQuery, DiagnoseSearchQueryVariables>
export const SaveDraftDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'SaveDraft' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'draftId' } },
                    type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
                },
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'values' } },
                    type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'JSON' } } },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'saveDraft' },
                        arguments: [
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'draftId' },
                                value: { kind: 'Variable', name: { kind: 'Name', value: 'draftId' } },
                            },
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'values' },
                                value: { kind: 'Variable', name: { kind: 'Name', value: 'values' } },
                            },
                        ],
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'draftId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'values' } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<SaveDraftMutation, SaveDraftMutationVariables>
export const DeleteDraftDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'DeleteDraft' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'draftId' } },
                    type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'deleteDraft' },
                        arguments: [
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'draftId' },
                                value: { kind: 'Variable', name: { kind: 'Name', value: 'draftId' } },
                            },
                        ],
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<DeleteDraftMutation, DeleteDraftMutationVariables>
export const GetDraftDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'query',
            name: { kind: 'Name', value: 'GetDraft' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'draftId' } },
                    type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'draft' },
                        arguments: [
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'draftId' },
                                value: { kind: 'Variable', name: { kind: 'Name', value: 'draftId' } },
                            },
                        ],
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'draftId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'values' } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<GetDraftQuery, GetDraftQueryVariables>
export const GetAllDraftsDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'query',
            name: { kind: 'Name', value: 'GetAllDrafts' },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'drafts' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'draftId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'values' } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<GetAllDraftsQuery, GetAllDraftsQueryVariables>
export const KonsultasjonDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'query',
            name: { kind: 'Name', value: 'Konsultasjon' },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'konsultasjon' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'diagnoser' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'FragmentSpread', name: { kind: 'Name', value: 'Diagnose' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'Diagnose' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Diagnose' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'system' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'code' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'text' } },
                ],
            },
        },
    ],
} as unknown as DocumentNode<KonsultasjonQuery, KonsultasjonQueryVariables>
export const PasientDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'query',
            name: { kind: 'Name', value: 'Pasient' },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'pasient' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'Person' } }],
                        },
                    },
                ],
            },
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'Person' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Person' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'ident' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'navn' } },
                ],
            },
        },
    ],
} as unknown as DocumentNode<PasientQuery, PasientQueryVariables>
export const PersonByIdentDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'query',
            name: { kind: 'Name', value: 'PersonByIdent' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'ident' } },
                    type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'person' },
                        arguments: [
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'ident' },
                                value: { kind: 'Variable', name: { kind: 'Name', value: 'ident' } },
                            },
                        ],
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'Person' } }],
                        },
                    },
                ],
            },
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'Person' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Person' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'ident' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'navn' } },
                ],
            },
        },
    ],
} as unknown as DocumentNode<PersonByIdentQuery, PersonByIdentQueryVariables>
export const SykmeldingByIdDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'query',
            name: { kind: 'Name', value: 'SykmeldingById' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
                    type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'sykmelding' },
                        arguments: [
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'id' },
                                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
                            },
                        ],
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'Sykmelding' } }],
                        },
                    },
                ],
            },
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'Aktivitet' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Aktivitet' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'FomTom' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'fom' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'tom' } },
                            ],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AktivitetIkkeMulig' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [{ kind: 'Field', name: { kind: 'Name', value: 'type' } }],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Avventende' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'innspillTilArbeidsgiver' } },
                            ],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Behandlingsdager' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'antallBehandlingsdager' } },
                            ],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Gradert' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'grad' } },
                            ],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Reisetilskudd' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [{ kind: 'Field', name: { kind: 'Name', value: 'type' } }],
                        },
                    },
                ],
            },
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'Sykmelding' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Sykmelding' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'sykmeldingId' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'pasient' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'navn' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'ident' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'diagnose' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'hoved' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'code' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'system' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'text' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'aktivitet' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'Aktivitet' } }],
                        },
                    },
                    { kind: 'Field', name: { kind: 'Name', value: 'documentStatus' } },
                ],
            },
        },
    ],
} as unknown as DocumentNode<SykmeldingByIdQuery, SykmeldingByIdQueryVariables>
export const OpprettSykmeldingDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'OpprettSykmelding' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'values' } },
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'OpprettSykmelding' } },
                    },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'opprettSykmelding' },
                        arguments: [
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'nySykmelding' },
                                value: { kind: 'Variable', name: { kind: 'Name', value: 'values' } },
                            },
                        ],
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [{ kind: 'Field', name: { kind: 'Name', value: 'sykmeldingId' } }],
                        },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<OpprettSykmeldingMutation, OpprettSykmeldingMutationVariables>
export const SynchronizeSykmeldingDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'SynchronizeSykmelding' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
                    type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'synchronizeSykmelding' },
                        arguments: [
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'id' },
                                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
                            },
                        ],
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'documentStatus' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'navStatus' } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<SynchronizeSykmeldingMutation, SynchronizeSykmeldingMutationVariables>
