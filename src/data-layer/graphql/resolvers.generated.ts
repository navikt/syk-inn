/* eslint-disable */
import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql'
export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> }
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> }
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never }
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never }
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> }
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
    ID: { input: string; output: string }
    String: { input: string; output: string }
    Boolean: { input: boolean; output: boolean }
    Int: { input: number; output: number }
    Float: { input: number; output: number }
    DateOnly: { input: string; output: string }
    DateTime: { input: string; output: string }
    JSON: { input: unknown; output: unknown }
}

export type Aktivitet = AktivitetIkkeMulig | Avventende | Behandlingsdager | Gradert | Reisetilskudd

export type AktivitetIkkeMulig = FomTom & {
    __typename?: 'AktivitetIkkeMulig'
    arbeidsrelatertArsak?: Maybe<ArbeidsrelatertArsak>
    fom: Scalars['DateOnly']['output']
    medisinskArsak?: Maybe<MedisinskArsak>
    tom: Scalars['DateOnly']['output']
    type: AktivitetType
}

export type AktivitetIkkeMuligInput = {
    dummy: Scalars['Boolean']['input']
}

export type AktivitetType = 'AKTIVITET_IKKE_MULIG' | 'AVVENTENDE' | 'BEHANDLINGSDAGER' | 'GRADERT' | 'REISETILSKUDD'

export type Arbeidsforhold = {
    __typename?: 'Arbeidsforhold'
    navn: Scalars['String']['output']
    orgnummer: Scalars['String']['output']
}

export type Arbeidsgiver = {
    __typename?: 'Arbeidsgiver'
    arbeidsgivernavn: Scalars['String']['output']
    harFlere: Scalars['Boolean']['output']
}

export type ArbeidsrelatertArsak = {
    __typename?: 'ArbeidsrelatertArsak'
    annenArbeidsrelatertArsak?: Maybe<Scalars['String']['output']>
    arbeidsrelaterteArsaker: Array<ArbeidsrelatertArsakType>
    isArbeidsrelatertArsak: Scalars['Boolean']['output']
}

export type ArbeidsrelatertArsakInput = {
    annenArbeidsrelatertArsak?: InputMaybe<Scalars['String']['input']>
    arbeidsrelaterteArsaker: Array<Scalars['String']['input']>
    isArbeidsrelatertArsak: Scalars['Boolean']['input']
}

export type ArbeidsrelatertArsakType = 'ANNET' | 'TILRETTELEGGING_IKKE_MULIG'

export type Avventende = FomTom & {
    __typename?: 'Avventende'
    fom: Scalars['DateOnly']['output']
    innspillTilArbeidsgiver: Scalars['String']['output']
    tom: Scalars['DateOnly']['output']
    type: AktivitetType
}

export type AvventendeInput = {
    innspillTilArbeidsgiver: Scalars['String']['input']
}

export type Behandler = {
    __typename?: 'Behandler'
    hpr: Scalars['String']['output']
    legekontorTlf: Scalars['String']['output']
    navn: Scalars['String']['output']
    orgnummer: Scalars['String']['output']
}

export type Behandlingsdager = FomTom & {
    __typename?: 'Behandlingsdager'
    antallBehandlingsdager: Scalars['Int']['output']
    fom: Scalars['DateOnly']['output']
    tom: Scalars['DateOnly']['output']
    type: AktivitetType
}

export type BehandlingsdagerInput = {
    antallBehandlingsdager: Scalars['Int']['input']
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

export type GradertInput = {
    grad: Scalars['Int']['input']
    reisetilskudd: Scalars['Boolean']['input']
}

/**
 * An ugly approach because the limitations of GraphQL
 * input types where union types are not supported.
 *
 * See: https://github.com/graphql/graphql-wg/blob/main/rfcs/InputUnion.md
 */
export type InputAktivitet = {
    aktivitetIkkeMulig?: InputMaybe<AktivitetIkkeMuligInput>
    arbeidsrelatertArsak?: InputMaybe<ArbeidsrelatertArsakInput>
    avventende?: InputMaybe<AvventendeInput>
    behandlingsdager?: InputMaybe<BehandlingsdagerInput>
    fom: Scalars['String']['input']
    gradert?: InputMaybe<GradertInput>
    medisinskArsak?: InputMaybe<MedisinskArsakInput>
    reisetilskudd?: InputMaybe<ReisetilskuddInput>
    tom: Scalars['String']['input']
    type: AktivitetType
}

export type InputArbeidsforhold = {
    arbeidsgivernavn: Scalars['String']['input']
}

export type InputDiagnose = {
    code: Scalars['String']['input']
    system: DiagnoseSystem
}

export type InputMeldinger = {
    tilArbeidsgiver?: InputMaybe<Scalars['String']['input']>
    tilNav?: InputMaybe<Scalars['String']['input']>
}

export type InputTilbakedatering = {
    begrunnelse: Scalars['String']['input']
    startdato: Scalars['String']['input']
}

export type InputYrkesskade = {
    skadedato?: InputMaybe<Scalars['DateOnly']['input']>
    yrkesskade: Scalars['Boolean']['input']
}

export type Konsultasjon = {
    __typename?: 'Konsultasjon'
    diagnoser?: Maybe<Array<Diagnose>>
}

export type MedisinskArsak = {
    __typename?: 'MedisinskArsak'
    isMedisinskArsak: Scalars['Boolean']['output']
}

export type MedisinskArsakInput = {
    isMedisinskArsak: Scalars['Boolean']['input']
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
    draftId: Scalars['String']['input']
    values: OpprettSykmeldingInput
}

export type MutationSaveDraftArgs = {
    draftId: Scalars['String']['input']
    values: Scalars['JSON']['input']
}

export type MutationSynchronizeSykmeldingArgs = {
    id: Scalars['String']['input']
}

export type OpprettSykmeldingDraft = {
    __typename?: 'OpprettSykmeldingDraft'
    draftId: Scalars['String']['output']
    lastUpdated: Scalars['DateTime']['output']
    values: Scalars['JSON']['output']
}

export type OpprettSykmeldingInput = {
    aktivitet: Array<InputAktivitet>
    arbeidsforhold?: InputMaybe<InputArbeidsforhold>
    bidiagnoser: Array<InputDiagnose>
    hoveddiagnose: InputDiagnose
    meldinger: InputMeldinger
    pasientenSkalSkjermes: Scalars['Boolean']['input']
    svangerskapsrelatert: Scalars['Boolean']['input']
    tilbakedatering?: InputMaybe<InputTilbakedatering>
    yrkesskade?: InputMaybe<InputYrkesskade>
}

export type OpprettSykmeldingRuleOutcome = {
    __typename?: 'OpprettSykmeldingRuleOutcome'
    message: Scalars['String']['output']
    rule: Scalars['String']['output']
    status: Scalars['String']['output']
    tree: Scalars['String']['output']
}

export type OpprettetSykmelding = OpprettSykmeldingRuleOutcome | Sykmelding

export type Outcome = {
    __typename?: 'Outcome'
    message?: Maybe<Scalars['String']['output']>
    result: Scalars['String']['output']
}

export type Pasient = Person & {
    __typename?: 'Pasient'
    arbeidsforhold?: Maybe<Array<Arbeidsforhold>>
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
    sykmeldinger?: Maybe<Array<Sykmelding>>
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

export type ReisetilskuddInput = {
    dummy: Scalars['Boolean']['input']
}

export type Sykmelding = {
    __typename?: 'Sykmelding'
    /** Status on the document in the EHR system. */
    documentStatus?: Maybe<DocumentStatus>
    meta: SykmeldingMeta
    sykmeldingId: Scalars['String']['output']
    utfall: Outcome
    values: SykmeldingValues
}

export type SykmeldingMelding = {
    __typename?: 'SykmeldingMelding'
    tilArbeidsgiver?: Maybe<Scalars['String']['output']>
    tilNav?: Maybe<Scalars['String']['output']>
}

export type SykmeldingMeta = {
    __typename?: 'SykmeldingMeta'
    legekontorOrgnr: Scalars['String']['output']
    mottatt: Scalars['DateTime']['output']
    pasientIdent: Scalars['String']['output']
    sykmelderHpr: Scalars['String']['output']
}

export type SykmeldingValues = {
    __typename?: 'SykmeldingValues'
    aktivitet: Array<Aktivitet>
    arbeidsgiver?: Maybe<Arbeidsgiver>
    bidiagnoser?: Maybe<Array<Diagnose>>
    hoveddiagnose?: Maybe<Diagnose>
    meldinger: SykmeldingMelding
    pasientenSkalSkjermes: Scalars['Boolean']['output']
    svangerskapsrelatert: Scalars['Boolean']['output']
    tilbakedatering?: Maybe<Tilbakedatering>
    yrkesskade?: Maybe<Yrkesskade>
}

export type SynchronizationStatus = {
    __typename?: 'SynchronizationStatus'
    documentStatus: DocumentStatus
    navStatus: DocumentStatus
}

export type Tilbakedatering = {
    __typename?: 'Tilbakedatering'
    begrunnelse: Scalars['String']['output']
    startdato: Scalars['DateOnly']['output']
}

export type Yrkesskade = {
    __typename?: 'Yrkesskade'
    skadedato?: Maybe<Scalars['DateOnly']['output']>
    yrkesskade: Scalars['Boolean']['output']
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

/** Mapping of union types */
export type ResolversUnionTypes<_RefType extends Record<string, unknown>> = {
    Aktivitet: AktivitetIkkeMulig | Avventende | Behandlingsdager | Gradert | Reisetilskudd
    OpprettetSykmelding:
        | OpprettSykmeldingRuleOutcome
        | (Omit<Sykmelding, 'values'> & { values: _RefType['SykmeldingValues'] })
}

/** Mapping of interface types */
export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> = {
    FomTom: AktivitetIkkeMulig | Avventende | Behandlingsdager | Gradert | Reisetilskudd
    Person: Pasient | QueriedPerson
}

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
    Aktivitet: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['Aktivitet']>
    AktivitetIkkeMulig: ResolverTypeWrapper<AktivitetIkkeMulig>
    AktivitetIkkeMuligInput: AktivitetIkkeMuligInput
    AktivitetType: AktivitetType
    Arbeidsforhold: ResolverTypeWrapper<Arbeidsforhold>
    Arbeidsgiver: ResolverTypeWrapper<Arbeidsgiver>
    ArbeidsrelatertArsak: ResolverTypeWrapper<ArbeidsrelatertArsak>
    ArbeidsrelatertArsakInput: ArbeidsrelatertArsakInput
    ArbeidsrelatertArsakType: ArbeidsrelatertArsakType
    Avventende: ResolverTypeWrapper<Avventende>
    AvventendeInput: AvventendeInput
    Behandler: ResolverTypeWrapper<Behandler>
    Behandlingsdager: ResolverTypeWrapper<Behandlingsdager>
    BehandlingsdagerInput: BehandlingsdagerInput
    Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>
    DateOnly: ResolverTypeWrapper<Scalars['DateOnly']['output']>
    DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>
    Diagnose: ResolverTypeWrapper<Diagnose>
    DiagnoseSystem: DiagnoseSystem
    DocumentStatus: DocumentStatus
    FomTom: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['FomTom']>
    Gradert: ResolverTypeWrapper<Gradert>
    GradertInput: GradertInput
    InputAktivitet: InputAktivitet
    InputArbeidsforhold: InputArbeidsforhold
    InputDiagnose: InputDiagnose
    InputMeldinger: InputMeldinger
    InputTilbakedatering: InputTilbakedatering
    InputYrkesskade: InputYrkesskade
    Int: ResolverTypeWrapper<Scalars['Int']['output']>
    JSON: ResolverTypeWrapper<Scalars['JSON']['output']>
    Konsultasjon: ResolverTypeWrapper<Konsultasjon>
    MedisinskArsak: ResolverTypeWrapper<MedisinskArsak>
    MedisinskArsakInput: MedisinskArsakInput
    Mutation: ResolverTypeWrapper<{}>
    OpprettSykmeldingDraft: ResolverTypeWrapper<OpprettSykmeldingDraft>
    OpprettSykmeldingInput: OpprettSykmeldingInput
    OpprettSykmeldingRuleOutcome: ResolverTypeWrapper<OpprettSykmeldingRuleOutcome>
    OpprettetSykmelding: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['OpprettetSykmelding']>
    Outcome: ResolverTypeWrapper<Outcome>
    Pasient: ResolverTypeWrapper<Pasient>
    Person: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Person']>
    QueriedPerson: ResolverTypeWrapper<QueriedPerson>
    Query: ResolverTypeWrapper<{}>
    Reisetilskudd: ResolverTypeWrapper<Reisetilskudd>
    ReisetilskuddInput: ReisetilskuddInput
    String: ResolverTypeWrapper<Scalars['String']['output']>
    Sykmelding: ResolverTypeWrapper<Omit<Sykmelding, 'values'> & { values: ResolversTypes['SykmeldingValues'] }>
    SykmeldingMelding: ResolverTypeWrapper<SykmeldingMelding>
    SykmeldingMeta: ResolverTypeWrapper<SykmeldingMeta>
    SykmeldingValues: ResolverTypeWrapper<
        Omit<SykmeldingValues, 'aktivitet'> & { aktivitet: Array<ResolversTypes['Aktivitet']> }
    >
    SynchronizationStatus: ResolverTypeWrapper<SynchronizationStatus>
    Tilbakedatering: ResolverTypeWrapper<Tilbakedatering>
    Yrkesskade: ResolverTypeWrapper<Yrkesskade>
}

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
    Aktivitet: ResolversUnionTypes<ResolversParentTypes>['Aktivitet']
    AktivitetIkkeMulig: AktivitetIkkeMulig
    AktivitetIkkeMuligInput: AktivitetIkkeMuligInput
    Arbeidsforhold: Arbeidsforhold
    Arbeidsgiver: Arbeidsgiver
    ArbeidsrelatertArsak: ArbeidsrelatertArsak
    ArbeidsrelatertArsakInput: ArbeidsrelatertArsakInput
    Avventende: Avventende
    AvventendeInput: AvventendeInput
    Behandler: Behandler
    Behandlingsdager: Behandlingsdager
    BehandlingsdagerInput: BehandlingsdagerInput
    Boolean: Scalars['Boolean']['output']
    DateOnly: Scalars['DateOnly']['output']
    DateTime: Scalars['DateTime']['output']
    Diagnose: Diagnose
    FomTom: ResolversInterfaceTypes<ResolversParentTypes>['FomTom']
    Gradert: Gradert
    GradertInput: GradertInput
    InputAktivitet: InputAktivitet
    InputArbeidsforhold: InputArbeidsforhold
    InputDiagnose: InputDiagnose
    InputMeldinger: InputMeldinger
    InputTilbakedatering: InputTilbakedatering
    InputYrkesskade: InputYrkesskade
    Int: Scalars['Int']['output']
    JSON: Scalars['JSON']['output']
    Konsultasjon: Konsultasjon
    MedisinskArsak: MedisinskArsak
    MedisinskArsakInput: MedisinskArsakInput
    Mutation: {}
    OpprettSykmeldingDraft: OpprettSykmeldingDraft
    OpprettSykmeldingInput: OpprettSykmeldingInput
    OpprettSykmeldingRuleOutcome: OpprettSykmeldingRuleOutcome
    OpprettetSykmelding: ResolversUnionTypes<ResolversParentTypes>['OpprettetSykmelding']
    Outcome: Outcome
    Pasient: Pasient
    Person: ResolversInterfaceTypes<ResolversParentTypes>['Person']
    QueriedPerson: QueriedPerson
    Query: {}
    Reisetilskudd: Reisetilskudd
    ReisetilskuddInput: ReisetilskuddInput
    String: Scalars['String']['output']
    Sykmelding: Omit<Sykmelding, 'values'> & { values: ResolversParentTypes['SykmeldingValues'] }
    SykmeldingMelding: SykmeldingMelding
    SykmeldingMeta: SykmeldingMeta
    SykmeldingValues: Omit<SykmeldingValues, 'aktivitet'> & { aktivitet: Array<ResolversParentTypes['Aktivitet']> }
    SynchronizationStatus: SynchronizationStatus
    Tilbakedatering: Tilbakedatering
    Yrkesskade: Yrkesskade
}

export type AktivitetResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['Aktivitet'] = ResolversParentTypes['Aktivitet'],
> = {
    __resolveType: TypeResolveFn<
        'AktivitetIkkeMulig' | 'Avventende' | 'Behandlingsdager' | 'Gradert' | 'Reisetilskudd',
        ParentType,
        ContextType
    >
}

export type AktivitetIkkeMuligResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['AktivitetIkkeMulig'] = ResolversParentTypes['AktivitetIkkeMulig'],
> = {
    arbeidsrelatertArsak?: Resolver<Maybe<ResolversTypes['ArbeidsrelatertArsak']>, ParentType, ContextType>
    fom?: Resolver<ResolversTypes['DateOnly'], ParentType, ContextType>
    medisinskArsak?: Resolver<Maybe<ResolversTypes['MedisinskArsak']>, ParentType, ContextType>
    tom?: Resolver<ResolversTypes['DateOnly'], ParentType, ContextType>
    type?: Resolver<ResolversTypes['AktivitetType'], ParentType, ContextType>
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type ArbeidsforholdResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['Arbeidsforhold'] = ResolversParentTypes['Arbeidsforhold'],
> = {
    navn?: Resolver<ResolversTypes['String'], ParentType, ContextType>
    orgnummer?: Resolver<ResolversTypes['String'], ParentType, ContextType>
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type ArbeidsgiverResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['Arbeidsgiver'] = ResolversParentTypes['Arbeidsgiver'],
> = {
    arbeidsgivernavn?: Resolver<ResolversTypes['String'], ParentType, ContextType>
    harFlere?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type ArbeidsrelatertArsakResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['ArbeidsrelatertArsak'] = ResolversParentTypes['ArbeidsrelatertArsak'],
> = {
    annenArbeidsrelatertArsak?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
    arbeidsrelaterteArsaker?: Resolver<Array<ResolversTypes['ArbeidsrelatertArsakType']>, ParentType, ContextType>
    isArbeidsrelatertArsak?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type AvventendeResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['Avventende'] = ResolversParentTypes['Avventende'],
> = {
    fom?: Resolver<ResolversTypes['DateOnly'], ParentType, ContextType>
    innspillTilArbeidsgiver?: Resolver<ResolversTypes['String'], ParentType, ContextType>
    tom?: Resolver<ResolversTypes['DateOnly'], ParentType, ContextType>
    type?: Resolver<ResolversTypes['AktivitetType'], ParentType, ContextType>
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type BehandlerResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['Behandler'] = ResolversParentTypes['Behandler'],
> = {
    hpr?: Resolver<ResolversTypes['String'], ParentType, ContextType>
    legekontorTlf?: Resolver<ResolversTypes['String'], ParentType, ContextType>
    navn?: Resolver<ResolversTypes['String'], ParentType, ContextType>
    orgnummer?: Resolver<ResolversTypes['String'], ParentType, ContextType>
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type BehandlingsdagerResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['Behandlingsdager'] = ResolversParentTypes['Behandlingsdager'],
> = {
    antallBehandlingsdager?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
    fom?: Resolver<ResolversTypes['DateOnly'], ParentType, ContextType>
    tom?: Resolver<ResolversTypes['DateOnly'], ParentType, ContextType>
    type?: Resolver<ResolversTypes['AktivitetType'], ParentType, ContextType>
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export interface DateOnlyScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateOnly'], any> {
    name: 'DateOnly'
}

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
    name: 'DateTime'
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

export type FomTomResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['FomTom'] = ResolversParentTypes['FomTom'],
> = {
    __resolveType: TypeResolveFn<
        'AktivitetIkkeMulig' | 'Avventende' | 'Behandlingsdager' | 'Gradert' | 'Reisetilskudd',
        ParentType,
        ContextType
    >
    fom?: Resolver<ResolversTypes['DateOnly'], ParentType, ContextType>
    tom?: Resolver<ResolversTypes['DateOnly'], ParentType, ContextType>
}

export type GradertResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['Gradert'] = ResolversParentTypes['Gradert'],
> = {
    fom?: Resolver<ResolversTypes['DateOnly'], ParentType, ContextType>
    grad?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
    tom?: Resolver<ResolversTypes['DateOnly'], ParentType, ContextType>
    type?: Resolver<ResolversTypes['AktivitetType'], ParentType, ContextType>
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export interface JsonScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSON'], any> {
    name: 'JSON'
}

export type KonsultasjonResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['Konsultasjon'] = ResolversParentTypes['Konsultasjon'],
> = {
    diagnoser?: Resolver<Maybe<Array<ResolversTypes['Diagnose']>>, ParentType, ContextType>
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type MedisinskArsakResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['MedisinskArsak'] = ResolversParentTypes['MedisinskArsak'],
> = {
    isMedisinskArsak?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type MutationResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation'],
> = {
    deleteDraft?: Resolver<
        ResolversTypes['Boolean'],
        ParentType,
        ContextType,
        RequireFields<MutationDeleteDraftArgs, 'draftId'>
    >
    opprettSykmelding?: Resolver<
        ResolversTypes['OpprettetSykmelding'],
        ParentType,
        ContextType,
        RequireFields<MutationOpprettSykmeldingArgs, 'draftId' | 'values'>
    >
    saveDraft?: Resolver<
        ResolversTypes['OpprettSykmeldingDraft'],
        ParentType,
        ContextType,
        RequireFields<MutationSaveDraftArgs, 'draftId' | 'values'>
    >
    synchronizeSykmelding?: Resolver<
        ResolversTypes['SynchronizationStatus'],
        ParentType,
        ContextType,
        RequireFields<MutationSynchronizeSykmeldingArgs, 'id'>
    >
}

export type OpprettSykmeldingDraftResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['OpprettSykmeldingDraft'] = ResolversParentTypes['OpprettSykmeldingDraft'],
> = {
    draftId?: Resolver<ResolversTypes['String'], ParentType, ContextType>
    lastUpdated?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>
    values?: Resolver<ResolversTypes['JSON'], ParentType, ContextType>
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type OpprettSykmeldingRuleOutcomeResolvers<
    ContextType = any,
    ParentType extends
        ResolversParentTypes['OpprettSykmeldingRuleOutcome'] = ResolversParentTypes['OpprettSykmeldingRuleOutcome'],
> = {
    message?: Resolver<ResolversTypes['String'], ParentType, ContextType>
    rule?: Resolver<ResolversTypes['String'], ParentType, ContextType>
    status?: Resolver<ResolversTypes['String'], ParentType, ContextType>
    tree?: Resolver<ResolversTypes['String'], ParentType, ContextType>
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type OpprettetSykmeldingResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['OpprettetSykmelding'] = ResolversParentTypes['OpprettetSykmelding'],
> = {
    __resolveType: TypeResolveFn<'OpprettSykmeldingRuleOutcome' | 'Sykmelding', ParentType, ContextType>
}

export type OutcomeResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['Outcome'] = ResolversParentTypes['Outcome'],
> = {
    message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
    result?: Resolver<ResolversTypes['String'], ParentType, ContextType>
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type PasientResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['Pasient'] = ResolversParentTypes['Pasient'],
> = {
    arbeidsforhold?: Resolver<Maybe<Array<ResolversTypes['Arbeidsforhold']>>, ParentType, ContextType>
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
    draft?: Resolver<
        Maybe<ResolversTypes['OpprettSykmeldingDraft']>,
        ParentType,
        ContextType,
        RequireFields<QueryDraftArgs, 'draftId'>
    >
    drafts?: Resolver<Maybe<Array<ResolversTypes['OpprettSykmeldingDraft']>>, ParentType, ContextType>
    konsultasjon?: Resolver<Maybe<ResolversTypes['Konsultasjon']>, ParentType, ContextType>
    pasient?: Resolver<Maybe<ResolversTypes['Pasient']>, ParentType, ContextType>
    person?: Resolver<Maybe<ResolversTypes['QueriedPerson']>, ParentType, ContextType, Partial<QueryPersonArgs>>
    sykmelding?: Resolver<
        Maybe<ResolversTypes['Sykmelding']>,
        ParentType,
        ContextType,
        RequireFields<QuerySykmeldingArgs, 'id'>
    >
    sykmeldinger?: Resolver<Maybe<Array<ResolversTypes['Sykmelding']>>, ParentType, ContextType>
}

export type ReisetilskuddResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['Reisetilskudd'] = ResolversParentTypes['Reisetilskudd'],
> = {
    fom?: Resolver<ResolversTypes['DateOnly'], ParentType, ContextType>
    tom?: Resolver<ResolversTypes['DateOnly'], ParentType, ContextType>
    type?: Resolver<ResolversTypes['AktivitetType'], ParentType, ContextType>
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type SykmeldingResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['Sykmelding'] = ResolversParentTypes['Sykmelding'],
> = {
    documentStatus?: Resolver<Maybe<ResolversTypes['DocumentStatus']>, ParentType, ContextType>
    meta?: Resolver<ResolversTypes['SykmeldingMeta'], ParentType, ContextType>
    sykmeldingId?: Resolver<ResolversTypes['String'], ParentType, ContextType>
    utfall?: Resolver<ResolversTypes['Outcome'], ParentType, ContextType>
    values?: Resolver<ResolversTypes['SykmeldingValues'], ParentType, ContextType>
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type SykmeldingMeldingResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['SykmeldingMelding'] = ResolversParentTypes['SykmeldingMelding'],
> = {
    tilArbeidsgiver?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
    tilNav?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type SykmeldingMetaResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['SykmeldingMeta'] = ResolversParentTypes['SykmeldingMeta'],
> = {
    legekontorOrgnr?: Resolver<ResolversTypes['String'], ParentType, ContextType>
    mottatt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>
    pasientIdent?: Resolver<ResolversTypes['String'], ParentType, ContextType>
    sykmelderHpr?: Resolver<ResolversTypes['String'], ParentType, ContextType>
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type SykmeldingValuesResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['SykmeldingValues'] = ResolversParentTypes['SykmeldingValues'],
> = {
    aktivitet?: Resolver<Array<ResolversTypes['Aktivitet']>, ParentType, ContextType>
    arbeidsgiver?: Resolver<Maybe<ResolversTypes['Arbeidsgiver']>, ParentType, ContextType>
    bidiagnoser?: Resolver<Maybe<Array<ResolversTypes['Diagnose']>>, ParentType, ContextType>
    hoveddiagnose?: Resolver<Maybe<ResolversTypes['Diagnose']>, ParentType, ContextType>
    meldinger?: Resolver<ResolversTypes['SykmeldingMelding'], ParentType, ContextType>
    pasientenSkalSkjermes?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
    svangerskapsrelatert?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
    tilbakedatering?: Resolver<Maybe<ResolversTypes['Tilbakedatering']>, ParentType, ContextType>
    yrkesskade?: Resolver<Maybe<ResolversTypes['Yrkesskade']>, ParentType, ContextType>
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

export type TilbakedateringResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['Tilbakedatering'] = ResolversParentTypes['Tilbakedatering'],
> = {
    begrunnelse?: Resolver<ResolversTypes['String'], ParentType, ContextType>
    startdato?: Resolver<ResolversTypes['DateOnly'], ParentType, ContextType>
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type YrkesskadeResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['Yrkesskade'] = ResolversParentTypes['Yrkesskade'],
> = {
    skadedato?: Resolver<Maybe<ResolversTypes['DateOnly']>, ParentType, ContextType>
    yrkesskade?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type Resolvers<ContextType = any> = {
    Aktivitet?: AktivitetResolvers<ContextType>
    AktivitetIkkeMulig?: AktivitetIkkeMuligResolvers<ContextType>
    Arbeidsforhold?: ArbeidsforholdResolvers<ContextType>
    Arbeidsgiver?: ArbeidsgiverResolvers<ContextType>
    ArbeidsrelatertArsak?: ArbeidsrelatertArsakResolvers<ContextType>
    Avventende?: AvventendeResolvers<ContextType>
    Behandler?: BehandlerResolvers<ContextType>
    Behandlingsdager?: BehandlingsdagerResolvers<ContextType>
    DateOnly?: GraphQLScalarType
    DateTime?: GraphQLScalarType
    Diagnose?: DiagnoseResolvers<ContextType>
    FomTom?: FomTomResolvers<ContextType>
    Gradert?: GradertResolvers<ContextType>
    JSON?: GraphQLScalarType
    Konsultasjon?: KonsultasjonResolvers<ContextType>
    MedisinskArsak?: MedisinskArsakResolvers<ContextType>
    Mutation?: MutationResolvers<ContextType>
    OpprettSykmeldingDraft?: OpprettSykmeldingDraftResolvers<ContextType>
    OpprettSykmeldingRuleOutcome?: OpprettSykmeldingRuleOutcomeResolvers<ContextType>
    OpprettetSykmelding?: OpprettetSykmeldingResolvers<ContextType>
    Outcome?: OutcomeResolvers<ContextType>
    Pasient?: PasientResolvers<ContextType>
    Person?: PersonResolvers<ContextType>
    QueriedPerson?: QueriedPersonResolvers<ContextType>
    Query?: QueryResolvers<ContextType>
    Reisetilskudd?: ReisetilskuddResolvers<ContextType>
    Sykmelding?: SykmeldingResolvers<ContextType>
    SykmeldingMelding?: SykmeldingMeldingResolvers<ContextType>
    SykmeldingMeta?: SykmeldingMetaResolvers<ContextType>
    SykmeldingValues?: SykmeldingValuesResolvers<ContextType>
    SynchronizationStatus?: SynchronizationStatusResolvers<ContextType>
    Tilbakedatering?: TilbakedateringResolvers<ContextType>
    Yrkesskade?: YrkesskadeResolvers<ContextType>
}
