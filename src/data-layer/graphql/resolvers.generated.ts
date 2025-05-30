/* eslint-disable */
import { GraphQLResolveInfo } from 'graphql'
export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> }
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> }
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never }
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never }
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> }
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
    ID: { input: string; output: string }
    String: { input: string; output: string }
    Boolean: { input: boolean; output: boolean }
    Int: { input: number; output: number }
    Float: { input: number; output: number }
}

export type Aktivitet = {
    __typename?: 'Aktivitet'
    fom: Scalars['String']['output']
    grad?: Maybe<Scalars['Int']['output']>
    tom: Scalars['String']['output']
    type: AktivitetType
}

export type AktivitetType = 'AKTIVITET_IKKE_MULIG' | 'GRADERT'

export type Behandler = {
    __typename?: 'Behandler'
    hpr: Scalars['String']['output']
    navn: Scalars['String']['output']
}

export type Diagnose = {
    __typename?: 'Diagnose'
    code: Scalars['String']['output']
    system: DiagnoseSystem
    text: Scalars['String']['output']
}

export type DiagnoseSystem = 'ICD10' | 'ICPC2'

export type DocumentStatus = 'COMPLETE' | 'ERRORED' | 'PENDING'

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
    opprettSykmelding: OpprettetSykmelding
    synchronizeSykmelding: SynchronizationStatus
}

export type MutationOpprettSykmeldingArgs = {
    nySykmelding: OpprettSykmelding
}

export type MutationSynchronizeSykmeldingArgs = {
    id: Scalars['String']['input']
}

export type OpprettSykmelding = {
    hoveddiagnose: InputDiagnose
    pasientIdent: Scalars['String']['input']
    perioder: Array<InputPeriode>
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
    konsultasjon?: Maybe<Konsultasjon>
    pasient?: Maybe<Pasient>
    person?: Maybe<QueriedPerson>
    sykmelding?: Maybe<Sykmelding>
}

export type QueryDiagnoseArgs = {
    query: Scalars['String']['input']
}

export type QueryPersonArgs = {
    ident?: InputMaybe<Scalars['String']['input']>
}

export type QuerySykmeldingArgs = {
    id: Scalars['String']['input']
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

export type ResolverTypeWrapper<T> = Promise<T> | T

export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
    resolve: ResolverFn<TResult, TParent, TContext, TArgs>
}
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
    | ResolverFn<TResult, TParent, TContext, TArgs>
    | ResolverWithResolve<TResult, TParent, TContext, TArgs>

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
    parent: TParent,
    args: TArgs,
    context: TContext,
    info: GraphQLResolveInfo,
) => Promise<TResult> | TResult

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
    parent: TParent,
    args: TArgs,
    context: TContext,
    info: GraphQLResolveInfo,
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
    parent: TParent,
    args: TArgs,
    context: TContext,
    info: GraphQLResolveInfo,
) => TResult | Promise<TResult>

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
    subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>
    resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
    subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>
    resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
    | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
    | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
    | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
    | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
    parent: TParent,
    context: TContext,
    info: GraphQLResolveInfo,
) => Maybe<TTypes> | Promise<Maybe<TTypes>>

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (
    obj: T,
    context: TContext,
    info: GraphQLResolveInfo,
) => boolean | Promise<boolean>

export type NextResolverFn<T> = () => Promise<T>

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
    next: NextResolverFn<TResult>,
    parent: TParent,
    args: TArgs,
    context: TContext,
    info: GraphQLResolveInfo,
) => TResult | Promise<TResult>

/** Mapping of interface types */
export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> = {
    Person: Pasient | QueriedPerson
}

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
    Aktivitet: ResolverTypeWrapper<Aktivitet>
    AktivitetType: AktivitetType
    Behandler: ResolverTypeWrapper<Behandler>
    Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>
    Diagnose: ResolverTypeWrapper<Diagnose>
    DiagnoseSystem: DiagnoseSystem
    DocumentStatus: DocumentStatus
    InputDiagnose: InputDiagnose
    InputPeriode: InputPeriode
    Int: ResolverTypeWrapper<Scalars['Int']['output']>
    Konsultasjon: ResolverTypeWrapper<Konsultasjon>
    Mutation: ResolverTypeWrapper<{}>
    OpprettSykmelding: OpprettSykmelding
    OpprettetSykmelding: ResolverTypeWrapper<OpprettetSykmelding>
    Pasient: ResolverTypeWrapper<Pasient>
    Person: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Person']>
    QueriedPerson: ResolverTypeWrapper<QueriedPerson>
    Query: ResolverTypeWrapper<{}>
    String: ResolverTypeWrapper<Scalars['String']['output']>
    Sykmelding: ResolverTypeWrapper<Sykmelding>
    SykmeldingDiagnoser: ResolverTypeWrapper<SykmeldingDiagnoser>
    SynchronizationStatus: ResolverTypeWrapper<SynchronizationStatus>
}

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
    Aktivitet: Aktivitet
    Behandler: Behandler
    Boolean: Scalars['Boolean']['output']
    Diagnose: Diagnose
    InputDiagnose: InputDiagnose
    InputPeriode: InputPeriode
    Int: Scalars['Int']['output']
    Konsultasjon: Konsultasjon
    Mutation: {}
    OpprettSykmelding: OpprettSykmelding
    OpprettetSykmelding: OpprettetSykmelding
    Pasient: Pasient
    Person: ResolversInterfaceTypes<ResolversParentTypes>['Person']
    QueriedPerson: QueriedPerson
    Query: {}
    String: Scalars['String']['output']
    Sykmelding: Sykmelding
    SykmeldingDiagnoser: SykmeldingDiagnoser
    SynchronizationStatus: SynchronizationStatus
}

export type AktivitetResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['Aktivitet'] = ResolversParentTypes['Aktivitet'],
> = {
    fom?: Resolver<ResolversTypes['String'], ParentType, ContextType>
    grad?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
    tom?: Resolver<ResolversTypes['String'], ParentType, ContextType>
    type?: Resolver<ResolversTypes['AktivitetType'], ParentType, ContextType>
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type BehandlerResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['Behandler'] = ResolversParentTypes['Behandler'],
> = {
    hpr?: Resolver<ResolversTypes['String'], ParentType, ContextType>
    navn?: Resolver<ResolversTypes['String'], ParentType, ContextType>
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type DiagnoseResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['Diagnose'] = ResolversParentTypes['Diagnose'],
> = {
    code?: Resolver<ResolversTypes['String'], ParentType, ContextType>
    system?: Resolver<ResolversTypes['DiagnoseSystem'], ParentType, ContextType>
    text?: Resolver<ResolversTypes['String'], ParentType, ContextType>
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type KonsultasjonResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['Konsultasjon'] = ResolversParentTypes['Konsultasjon'],
> = {
    diagnoser?: Resolver<Maybe<Array<ResolversTypes['Diagnose']>>, ParentType, ContextType>
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type MutationResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation'],
> = {
    opprettSykmelding?: Resolver<
        ResolversTypes['OpprettetSykmelding'],
        ParentType,
        ContextType,
        RequireFields<MutationOpprettSykmeldingArgs, 'nySykmelding'>
    >
    synchronizeSykmelding?: Resolver<
        ResolversTypes['SynchronizationStatus'],
        ParentType,
        ContextType,
        RequireFields<MutationSynchronizeSykmeldingArgs, 'id'>
    >
}

export type OpprettetSykmeldingResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['OpprettetSykmelding'] = ResolversParentTypes['OpprettetSykmelding'],
> = {
    sykmeldingId?: Resolver<ResolversTypes['String'], ParentType, ContextType>
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type PasientResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['Pasient'] = ResolversParentTypes['Pasient'],
> = {
    ident?: Resolver<ResolversTypes['String'], ParentType, ContextType>
    navn?: Resolver<ResolversTypes['String'], ParentType, ContextType>
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type PersonResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['Person'] = ResolversParentTypes['Person'],
> = {
    __resolveType: TypeResolveFn<'Pasient' | 'QueriedPerson', ParentType, ContextType>
    ident?: Resolver<ResolversTypes['String'], ParentType, ContextType>
    navn?: Resolver<ResolversTypes['String'], ParentType, ContextType>
}

export type QueriedPersonResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['QueriedPerson'] = ResolversParentTypes['QueriedPerson'],
> = {
    ident?: Resolver<ResolversTypes['String'], ParentType, ContextType>
    navn?: Resolver<ResolversTypes['String'], ParentType, ContextType>
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type QueryResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query'],
> = {
    behandler?: Resolver<Maybe<ResolversTypes['Behandler']>, ParentType, ContextType>
    diagnose?: Resolver<
        Maybe<Array<ResolversTypes['Diagnose']>>,
        ParentType,
        ContextType,
        RequireFields<QueryDiagnoseArgs, 'query'>
    >
    konsultasjon?: Resolver<Maybe<ResolversTypes['Konsultasjon']>, ParentType, ContextType>
    pasient?: Resolver<Maybe<ResolversTypes['Pasient']>, ParentType, ContextType>
    person?: Resolver<Maybe<ResolversTypes['QueriedPerson']>, ParentType, ContextType, Partial<QueryPersonArgs>>
    sykmelding?: Resolver<
        Maybe<ResolversTypes['Sykmelding']>,
        ParentType,
        ContextType,
        RequireFields<QuerySykmeldingArgs, 'id'>
    >
}

export type SykmeldingResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['Sykmelding'] = ResolversParentTypes['Sykmelding'],
> = {
    aktivitet?: Resolver<ResolversTypes['Aktivitet'], ParentType, ContextType>
    diagnose?: Resolver<ResolversTypes['SykmeldingDiagnoser'], ParentType, ContextType>
    documentStatus?: Resolver<ResolversTypes['DocumentStatus'], ParentType, ContextType>
    pasient?: Resolver<ResolversTypes['Pasient'], ParentType, ContextType>
    sykmeldingId?: Resolver<ResolversTypes['String'], ParentType, ContextType>
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type SykmeldingDiagnoserResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['SykmeldingDiagnoser'] = ResolversParentTypes['SykmeldingDiagnoser'],
> = {
    bi?: Resolver<Array<ResolversTypes['Diagnose']>, ParentType, ContextType>
    hoved?: Resolver<ResolversTypes['Diagnose'], ParentType, ContextType>
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type SynchronizationStatusResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['SynchronizationStatus'] = ResolversParentTypes['SynchronizationStatus'],
> = {
    documentStatus?: Resolver<ResolversTypes['DocumentStatus'], ParentType, ContextType>
    navStatus?: Resolver<ResolversTypes['DocumentStatus'], ParentType, ContextType>
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type Resolvers<ContextType = any> = {
    Aktivitet?: AktivitetResolvers<ContextType>
    Behandler?: BehandlerResolvers<ContextType>
    Diagnose?: DiagnoseResolvers<ContextType>
    Konsultasjon?: KonsultasjonResolvers<ContextType>
    Mutation?: MutationResolvers<ContextType>
    OpprettetSykmelding?: OpprettetSykmeldingResolvers<ContextType>
    Pasient?: PasientResolvers<ContextType>
    Person?: PersonResolvers<ContextType>
    QueriedPerson?: QueriedPersonResolvers<ContextType>
    Query?: QueryResolvers<ContextType>
    Sykmelding?: SykmeldingResolvers<ContextType>
    SykmeldingDiagnoser?: SykmeldingDiagnoserResolvers<ContextType>
    SynchronizationStatus?: SynchronizationStatusResolvers<ContextType>
}
