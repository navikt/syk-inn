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
    arbeidsrelatertArsak: ArbeidsrelatertArsakInput
    medisinskArsak: MedisinskArsakInput
}

export type AktivitetRedacted = FomTom & {
    __typename?: 'AktivitetRedacted'
    fom: Scalars['DateOnly']['output']
    tom: Scalars['DateOnly']['output']
    type: AktivitetType
}

export type AktivitetType = 'AKTIVITET_IKKE_MULIG' | 'AVVENTENDE' | 'BEHANDLINGSDAGER' | 'GRADERT' | 'REISETILSKUDD'

export type AnnenFravarsgrunnArsak =
    /** G: Når vedkommende er arbeidsufør som følge av svangerskapsavbrudd, */
    | 'ABORT'
    /** C: Når vedkommende deltar på et arbeidsrettet tiltak, */
    | 'ARBEIDSRETTET_TILTAK'
    /** J: Når vedkommende er arbeidsufør som følge av behandling i forbindelse med sterilisering */
    | 'BEHANDLING_STERILISERING'
    /** I: Når vedkommende er donor eller er under vurdering som donor, */
    | 'DONOR'
    /** A: Når vedkommende er innlagt i en godkjent helseinstitusjon */
    | 'GODKJENT_HELSEINSTITUSJON'
    /** D: Når vedkommende på grunn av sykdom, skade eller lyte får tilskott til opplæringstiltak etter § 10-7 tredje ledd, */
    | 'MOTTAR_TILSKUDD_GRUNNET_HELSETILSTAND'
    /** E: Når vedkommende er til nødvendig kontrollundersøkelse som krever minst 24 timers fravær, reisetid medregnet, */
    | 'NODVENDIG_KONTROLLUNDENRSOKELSE'
    /** F: Når vedkommende myndighet har nedlagt forbud mot at han eller hun arbeider på grunn av smittefare, */
    | 'SMITTEFARE'
    /** H: Når vedkommende er arbeidsufør som følge av behandling for barnløshet, */
    | 'UFOR_GRUNNET_BARNLOSHET'

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
    legekontorTlf?: Maybe<Scalars['String']['output']>
    navn: Scalars['String']['output']
    orgnummer?: Maybe<Scalars['String']['output']>
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

export type DiagnoseSystem = 'ICD10' | 'ICPC2' | 'ICPC2B'

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
    avventende?: InputMaybe<AvventendeInput>
    behandlingsdager?: InputMaybe<BehandlingsdagerInput>
    fom: Scalars['String']['input']
    gradert?: InputMaybe<GradertInput>
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

export type InputUtdypendeSporsmal = {
    hensynPaArbeidsplassen?: InputMaybe<Scalars['String']['input']>
    medisinskOppsummering?: InputMaybe<Scalars['String']['input']>
    utfordringerMedArbeid?: InputMaybe<Scalars['String']['input']>
}

export type InputYrkesskade = {
    skadedato?: InputMaybe<Scalars['DateOnly']['input']>
    yrkesskade: Scalars['Boolean']['input']
}

export type Konsultasjon = {
    __typename?: 'Konsultasjon'
    diagnoser?: Maybe<Array<Diagnose>>
    hasRequestedAccessToSykmeldinger?: Maybe<Scalars['Boolean']['output']>
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
    /**
     * Because we are not (yet) allowed to do any of the following:
     * - Verify that the patient exists
     * - Verify the practitioners existence
     * - Execute rules for payload
     *
     * We have to do a two-step process for creating a sykmelding.
     *
     * In the future, these checks will be done more optimistically
     */
    opprettSykmelding: OpprettetSykmelding
    requestAccessToSykmeldinger: Scalars['Boolean']['output']
    saveDraft: OpprettSykmeldingDraft
    synchronizeSykmelding: SynchronizationStatus
}

export type MutationDeleteDraftArgs = {
    draftId: Scalars['String']['input']
}

export type MutationOpprettSykmeldingArgs = {
    draftId: Scalars['String']['input']
    force: Scalars['Boolean']['input']
    meta: OpprettSykmeldingMetaInput
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
    annenFravarsgrunn?: InputMaybe<AnnenFravarsgrunnArsak>
    arbeidsforhold?: InputMaybe<InputArbeidsforhold>
    bidiagnoser: Array<InputDiagnose>
    hoveddiagnose: InputDiagnose
    meldinger: InputMeldinger
    pasientenSkalSkjermes: Scalars['Boolean']['input']
    svangerskapsrelatert: Scalars['Boolean']['input']
    tilbakedatering?: InputMaybe<InputTilbakedatering>
    utdypendeSporsmal?: InputMaybe<InputUtdypendeSporsmal>
    yrkesskade?: InputMaybe<InputYrkesskade>
}

export type OpprettSykmeldingMetaInput = {
    legekontorTlf?: InputMaybe<Scalars['String']['input']>
    orgnummer?: InputMaybe<Scalars['String']['input']>
}

export type OpprettetSykmelding = OtherSubmitOutcomes | RuleOutcome | SykmeldingFull

export type OtherSubmitOutcomes = {
    __typename?: 'OtherSubmitOutcomes'
    cause: OtherSubmitOutcomesEnum
}

export type OtherSubmitOutcomesEnum = 'MISSING_PRACTITIONER_INFO' | 'PATIENT_NOT_FOUND_IN_PDL'

export type Outcome = {
    __typename?: 'Outcome'
    melding?: Maybe<Scalars['String']['output']>
    result: Scalars['String']['output']
}

export type Pasient = Person & {
    __typename?: 'Pasient'
    arbeidsforhold?: Maybe<Array<Arbeidsforhold>>
    ident: Scalars['String']['output']
    navn: Scalars['String']['output']
    /** Does the user exist outside of FHIR? In other words, is this a real person? */
    userExists?: Maybe<Scalars['Boolean']['output']>
    utdypendeSporsmal?: Maybe<UtdypendeOpplysningerHint>
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
    sykmeldinger?: Maybe<Sykmeldinger>
}

export type QueryDiagnoseArgs = {
    query: Scalars['String']['input']
    systems: Array<DiagnoseSystem>
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

export type RuleOk = {
    __typename?: 'RuleOK'
    ok: Scalars['Boolean']['output']
}

export type RuleOutcome = {
    __typename?: 'RuleOutcome'
    message: Scalars['String']['output']
    rule: Scalars['String']['output']
    status: RuleOutcomeStatus
    tree: Scalars['String']['output']
}

export type RuleOutcomeStatus = 'INVALID' | 'MANUAL_PROCESSING'

export type Sykmelding = SykmeldingFull | SykmeldingLight | SykmeldingRedacted

export type SykmeldingBase = {
    kind: Scalars['String']['output']
    meta: SykmeldingMeta
    sykmeldingId: Scalars['String']['output']
    utfall: Outcome
}

/** A complete sykmelding, containing every value. */
export type SykmeldingFull = SykmeldingBase & {
    __typename?: 'SykmeldingFull'
    /** Status on the document in the EHR system. */
    documentStatus?: Maybe<DocumentStatus>
    kind: Scalars['String']['output']
    meta: SykmeldingMeta
    sykmeldingId: Scalars['String']['output']
    utfall: Outcome
    values: SykmeldingFullValues
}

export type SykmeldingFullValues = {
    __typename?: 'SykmeldingFullValues'
    aktivitet: Array<Aktivitet>
    annenFravarsgrunn?: Maybe<AnnenFravarsgrunnArsak>
    arbeidsgiver?: Maybe<Arbeidsgiver>
    bidiagnoser?: Maybe<Array<Diagnose>>
    hoveddiagnose?: Maybe<Diagnose>
    meldinger: SykmeldingMelding
    pasientenSkalSkjermes: Scalars['Boolean']['output']
    svangerskapsrelatert: Scalars['Boolean']['output']
    tilbakedatering?: Maybe<Tilbakedatering>
    utdypendeSporsmal?: Maybe<UtdypendeSporsmal>
    yrkesskade?: Maybe<Yrkesskade>
}

export type SykmeldingLight = SykmeldingBase & {
    __typename?: 'SykmeldingLight'
    /** Status on the document in the EHR system. */
    documentStatus?: Maybe<DocumentStatus>
    kind: Scalars['String']['output']
    meta: SykmeldingMeta
    sykmeldingId: Scalars['String']['output']
    utfall: Outcome
    values: SykmeldingLightValues
}

export type SykmeldingLightValues = {
    __typename?: 'SykmeldingLightValues'
    aktivitet: Array<Aktivitet>
    bidiagnoser?: Maybe<Array<Diagnose>>
    hoveddiagnose?: Maybe<Diagnose>
}

export type SykmeldingMelding = {
    __typename?: 'SykmeldingMelding'
    tilArbeidsgiver?: Maybe<Scalars['String']['output']>
    tilNav?: Maybe<Scalars['String']['output']>
}

export type SykmeldingMeta = {
    __typename?: 'SykmeldingMeta'
    legekontorOrgnr?: Maybe<Scalars['String']['output']>
    mottatt: Scalars['DateTime']['output']
    pasientIdent: Scalars['String']['output']
    sykmelderHpr: Scalars['String']['output']
}

/**
 * A completely redacted sykmelding, only containing the absolute bare minimum of information.
 *
 * To be potentially shared between different practitioners treating the same patient.
 */
export type SykmeldingRedacted = {
    __typename?: 'SykmeldingRedacted'
    kind: Scalars['String']['output']
    meta: SykmeldingMeta
    sykmeldingId: Scalars['String']['output']
    utfall: Outcome
    values: SykmeldingRedactedValues
}

export type SykmeldingRedactedValues = {
    __typename?: 'SykmeldingRedactedValues'
    aktivitet: Array<AktivitetRedacted>
}

export type SykmeldingValidering = RuleOk | RuleOutcome

export type Sykmeldinger = {
    __typename?: 'Sykmeldinger'
    current: Array<Sykmelding>
    historical: Array<Sykmelding>
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

export type UtdypendeOpplysningerHint = {
    __typename?: 'UtdypendeOpplysningerHint'
    days: Scalars['Int']['output']
    latestTom?: Maybe<Scalars['String']['output']>
    previouslyAnsweredSporsmal: Array<UtdypendeSporsmalOptions>
}

export type UtdypendeSporsmal = {
    __typename?: 'UtdypendeSporsmal'
    hensynPaArbeidsplassen?: Maybe<Scalars['String']['output']>
    medisinskOppsummering?: Maybe<Scalars['String']['output']>
    utfordringerMedArbeid?: Maybe<Scalars['String']['output']>
}

export type UtdypendeSporsmalOptions = 'HENSYN_PA_ARBEIDSPLASSEN' | 'MEDISINSK_OPPSUMMERING' | 'UTFORDRINGER_MED_ARBEID'

export type Yrkesskade = {
    __typename?: 'Yrkesskade'
    skadedato?: Maybe<Scalars['DateOnly']['output']>
    yrkesskade: Scalars['Boolean']['output']
}

export type ResolverTypeWrapper<T> = Promise<T> | T

export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
    resolve: ResolverFn<TResult, TParent, TContext, TArgs>
}
export type Resolver<
    TResult,
    TParent = Record<PropertyKey, never>,
    TContext = Record<PropertyKey, never>,
    TArgs = Record<PropertyKey, never>,
> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>

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

export type SubscriptionResolver<
    TResult,
    TKey extends string,
    TParent = Record<PropertyKey, never>,
    TContext = Record<PropertyKey, never>,
    TArgs = Record<PropertyKey, never>,
> =
    | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
    | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>

export type TypeResolveFn<TTypes, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
    parent: TParent,
    context: TContext,
    info: GraphQLResolveInfo,
) => Maybe<TTypes> | Promise<Maybe<TTypes>>

export type IsTypeOfResolverFn<T = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
    obj: T,
    context: TContext,
    info: GraphQLResolveInfo,
) => boolean | Promise<boolean>

export type NextResolverFn<T> = () => Promise<T>

export type DirectiveResolverFn<
    TResult = Record<PropertyKey, never>,
    TParent = Record<PropertyKey, never>,
    TContext = Record<PropertyKey, never>,
    TArgs = Record<PropertyKey, never>,
> = (
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
        | OtherSubmitOutcomes
        | RuleOutcome
        | (Omit<SykmeldingFull, 'values'> & { values: _RefType['SykmeldingFullValues'] })
    Sykmelding:
        | (Omit<SykmeldingFull, 'values'> & { values: _RefType['SykmeldingFullValues'] })
        | (Omit<SykmeldingLight, 'values'> & { values: _RefType['SykmeldingLightValues'] })
        | SykmeldingRedacted
    SykmeldingValidering: RuleOk | RuleOutcome
}

/** Mapping of interface types */
export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> = {
    FomTom: AktivitetIkkeMulig | AktivitetRedacted | Avventende | Behandlingsdager | Gradert | Reisetilskudd
    Person: Pasient | QueriedPerson
    SykmeldingBase:
        | (Omit<SykmeldingFull, 'values'> & { values: _RefType['SykmeldingFullValues'] })
        | (Omit<SykmeldingLight, 'values'> & { values: _RefType['SykmeldingLightValues'] })
}

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
    Aktivitet: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['Aktivitet']>
    AktivitetIkkeMulig: ResolverTypeWrapper<AktivitetIkkeMulig>
    AktivitetIkkeMuligInput: AktivitetIkkeMuligInput
    AktivitetRedacted: ResolverTypeWrapper<AktivitetRedacted>
    AktivitetType: AktivitetType
    AnnenFravarsgrunnArsak: AnnenFravarsgrunnArsak
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
    InputUtdypendeSporsmal: InputUtdypendeSporsmal
    InputYrkesskade: InputYrkesskade
    Int: ResolverTypeWrapper<Scalars['Int']['output']>
    JSON: ResolverTypeWrapper<Scalars['JSON']['output']>
    Konsultasjon: ResolverTypeWrapper<Konsultasjon>
    MedisinskArsak: ResolverTypeWrapper<MedisinskArsak>
    MedisinskArsakInput: MedisinskArsakInput
    Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>
    OpprettSykmeldingDraft: ResolverTypeWrapper<OpprettSykmeldingDraft>
    OpprettSykmeldingInput: OpprettSykmeldingInput
    OpprettSykmeldingMetaInput: OpprettSykmeldingMetaInput
    OpprettetSykmelding: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['OpprettetSykmelding']>
    OtherSubmitOutcomes: ResolverTypeWrapper<OtherSubmitOutcomes>
    OtherSubmitOutcomesEnum: OtherSubmitOutcomesEnum
    Outcome: ResolverTypeWrapper<Outcome>
    Pasient: ResolverTypeWrapper<Pasient>
    Person: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Person']>
    QueriedPerson: ResolverTypeWrapper<QueriedPerson>
    Query: ResolverTypeWrapper<Record<PropertyKey, never>>
    Reisetilskudd: ResolverTypeWrapper<Reisetilskudd>
    ReisetilskuddInput: ReisetilskuddInput
    RuleOK: ResolverTypeWrapper<RuleOk>
    RuleOutcome: ResolverTypeWrapper<RuleOutcome>
    RuleOutcomeStatus: RuleOutcomeStatus
    String: ResolverTypeWrapper<Scalars['String']['output']>
    Sykmelding: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['Sykmelding']>
    SykmeldingBase: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['SykmeldingBase']>
    SykmeldingFull: ResolverTypeWrapper<
        Omit<SykmeldingFull, 'values'> & { values: ResolversTypes['SykmeldingFullValues'] }
    >
    SykmeldingFullValues: ResolverTypeWrapper<
        Omit<SykmeldingFullValues, 'aktivitet'> & { aktivitet: Array<ResolversTypes['Aktivitet']> }
    >
    SykmeldingLight: ResolverTypeWrapper<
        Omit<SykmeldingLight, 'values'> & { values: ResolversTypes['SykmeldingLightValues'] }
    >
    SykmeldingLightValues: ResolverTypeWrapper<
        Omit<SykmeldingLightValues, 'aktivitet'> & { aktivitet: Array<ResolversTypes['Aktivitet']> }
    >
    SykmeldingMelding: ResolverTypeWrapper<SykmeldingMelding>
    SykmeldingMeta: ResolverTypeWrapper<SykmeldingMeta>
    SykmeldingRedacted: ResolverTypeWrapper<SykmeldingRedacted>
    SykmeldingRedactedValues: ResolverTypeWrapper<SykmeldingRedactedValues>
    SykmeldingValidering: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['SykmeldingValidering']>
    Sykmeldinger: ResolverTypeWrapper<
        Omit<Sykmeldinger, 'current' | 'historical'> & {
            current: Array<ResolversTypes['Sykmelding']>
            historical: Array<ResolversTypes['Sykmelding']>
        }
    >
    SynchronizationStatus: ResolverTypeWrapper<SynchronizationStatus>
    Tilbakedatering: ResolverTypeWrapper<Tilbakedatering>
    UtdypendeOpplysningerHint: ResolverTypeWrapper<UtdypendeOpplysningerHint>
    UtdypendeSporsmal: ResolverTypeWrapper<UtdypendeSporsmal>
    UtdypendeSporsmalOptions: UtdypendeSporsmalOptions
    Yrkesskade: ResolverTypeWrapper<Yrkesskade>
}

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
    Aktivitet: ResolversUnionTypes<ResolversParentTypes>['Aktivitet']
    AktivitetIkkeMulig: AktivitetIkkeMulig
    AktivitetIkkeMuligInput: AktivitetIkkeMuligInput
    AktivitetRedacted: AktivitetRedacted
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
    InputUtdypendeSporsmal: InputUtdypendeSporsmal
    InputYrkesskade: InputYrkesskade
    Int: Scalars['Int']['output']
    JSON: Scalars['JSON']['output']
    Konsultasjon: Konsultasjon
    MedisinskArsak: MedisinskArsak
    MedisinskArsakInput: MedisinskArsakInput
    Mutation: Record<PropertyKey, never>
    OpprettSykmeldingDraft: OpprettSykmeldingDraft
    OpprettSykmeldingInput: OpprettSykmeldingInput
    OpprettSykmeldingMetaInput: OpprettSykmeldingMetaInput
    OpprettetSykmelding: ResolversUnionTypes<ResolversParentTypes>['OpprettetSykmelding']
    OtherSubmitOutcomes: OtherSubmitOutcomes
    Outcome: Outcome
    Pasient: Pasient
    Person: ResolversInterfaceTypes<ResolversParentTypes>['Person']
    QueriedPerson: QueriedPerson
    Query: Record<PropertyKey, never>
    Reisetilskudd: Reisetilskudd
    ReisetilskuddInput: ReisetilskuddInput
    RuleOK: RuleOk
    RuleOutcome: RuleOutcome
    String: Scalars['String']['output']
    Sykmelding: ResolversUnionTypes<ResolversParentTypes>['Sykmelding']
    SykmeldingBase: ResolversInterfaceTypes<ResolversParentTypes>['SykmeldingBase']
    SykmeldingFull: Omit<SykmeldingFull, 'values'> & { values: ResolversParentTypes['SykmeldingFullValues'] }
    SykmeldingFullValues: Omit<SykmeldingFullValues, 'aktivitet'> & {
        aktivitet: Array<ResolversParentTypes['Aktivitet']>
    }
    SykmeldingLight: Omit<SykmeldingLight, 'values'> & { values: ResolversParentTypes['SykmeldingLightValues'] }
    SykmeldingLightValues: Omit<SykmeldingLightValues, 'aktivitet'> & {
        aktivitet: Array<ResolversParentTypes['Aktivitet']>
    }
    SykmeldingMelding: SykmeldingMelding
    SykmeldingMeta: SykmeldingMeta
    SykmeldingRedacted: SykmeldingRedacted
    SykmeldingRedactedValues: SykmeldingRedactedValues
    SykmeldingValidering: ResolversUnionTypes<ResolversParentTypes>['SykmeldingValidering']
    Sykmeldinger: Omit<Sykmeldinger, 'current' | 'historical'> & {
        current: Array<ResolversParentTypes['Sykmelding']>
        historical: Array<ResolversParentTypes['Sykmelding']>
    }
    SynchronizationStatus: SynchronizationStatus
    Tilbakedatering: Tilbakedatering
    UtdypendeOpplysningerHint: UtdypendeOpplysningerHint
    UtdypendeSporsmal: UtdypendeSporsmal
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

export type AktivitetRedactedResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['AktivitetRedacted'] = ResolversParentTypes['AktivitetRedacted'],
> = {
    fom?: Resolver<ResolversTypes['DateOnly'], ParentType, ContextType>
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
}

export type ArbeidsgiverResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['Arbeidsgiver'] = ResolversParentTypes['Arbeidsgiver'],
> = {
    arbeidsgivernavn?: Resolver<ResolversTypes['String'], ParentType, ContextType>
    harFlere?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
}

export type ArbeidsrelatertArsakResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['ArbeidsrelatertArsak'] = ResolversParentTypes['ArbeidsrelatertArsak'],
> = {
    annenArbeidsrelatertArsak?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
    arbeidsrelaterteArsaker?: Resolver<Array<ResolversTypes['ArbeidsrelatertArsakType']>, ParentType, ContextType>
    isArbeidsrelatertArsak?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
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
    legekontorTlf?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
    navn?: Resolver<ResolversTypes['String'], ParentType, ContextType>
    orgnummer?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
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
}

export type FomTomResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['FomTom'] = ResolversParentTypes['FomTom'],
> = {
    __resolveType: TypeResolveFn<
        'AktivitetIkkeMulig' | 'AktivitetRedacted' | 'Avventende' | 'Behandlingsdager' | 'Gradert' | 'Reisetilskudd',
        ParentType,
        ContextType
    >
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
    hasRequestedAccessToSykmeldinger?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>
}

export type MedisinskArsakResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['MedisinskArsak'] = ResolversParentTypes['MedisinskArsak'],
> = {
    isMedisinskArsak?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
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
        RequireFields<MutationOpprettSykmeldingArgs, 'draftId' | 'force' | 'meta' | 'values'>
    >
    requestAccessToSykmeldinger?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
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
}

export type OpprettetSykmeldingResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['OpprettetSykmelding'] = ResolversParentTypes['OpprettetSykmelding'],
> = {
    __resolveType: TypeResolveFn<'OtherSubmitOutcomes' | 'RuleOutcome' | 'SykmeldingFull', ParentType, ContextType>
}

export type OtherSubmitOutcomesResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['OtherSubmitOutcomes'] = ResolversParentTypes['OtherSubmitOutcomes'],
> = {
    cause?: Resolver<ResolversTypes['OtherSubmitOutcomesEnum'], ParentType, ContextType>
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type OutcomeResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['Outcome'] = ResolversParentTypes['Outcome'],
> = {
    melding?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
    result?: Resolver<ResolversTypes['String'], ParentType, ContextType>
}

export type PasientResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['Pasient'] = ResolversParentTypes['Pasient'],
> = {
    arbeidsforhold?: Resolver<Maybe<Array<ResolversTypes['Arbeidsforhold']>>, ParentType, ContextType>
    ident?: Resolver<ResolversTypes['String'], ParentType, ContextType>
    navn?: Resolver<ResolversTypes['String'], ParentType, ContextType>
    userExists?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>
    utdypendeSporsmal?: Resolver<Maybe<ResolversTypes['UtdypendeOpplysningerHint']>, ParentType, ContextType>
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type PersonResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['Person'] = ResolversParentTypes['Person'],
> = {
    __resolveType: TypeResolveFn<'Pasient' | 'QueriedPerson', ParentType, ContextType>
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
        RequireFields<QueryDiagnoseArgs, 'query' | 'systems'>
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
    sykmeldinger?: Resolver<Maybe<ResolversTypes['Sykmeldinger']>, ParentType, ContextType>
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

export type RuleOkResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['RuleOK'] = ResolversParentTypes['RuleOK'],
> = {
    ok?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type RuleOutcomeResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['RuleOutcome'] = ResolversParentTypes['RuleOutcome'],
> = {
    message?: Resolver<ResolversTypes['String'], ParentType, ContextType>
    rule?: Resolver<ResolversTypes['String'], ParentType, ContextType>
    status?: Resolver<ResolversTypes['RuleOutcomeStatus'], ParentType, ContextType>
    tree?: Resolver<ResolversTypes['String'], ParentType, ContextType>
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type SykmeldingResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['Sykmelding'] = ResolversParentTypes['Sykmelding'],
> = {
    __resolveType: TypeResolveFn<'SykmeldingFull' | 'SykmeldingLight' | 'SykmeldingRedacted', ParentType, ContextType>
}

export type SykmeldingBaseResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['SykmeldingBase'] = ResolversParentTypes['SykmeldingBase'],
> = {
    __resolveType: TypeResolveFn<'SykmeldingFull' | 'SykmeldingLight', ParentType, ContextType>
}

export type SykmeldingFullResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['SykmeldingFull'] = ResolversParentTypes['SykmeldingFull'],
> = {
    documentStatus?: Resolver<Maybe<ResolversTypes['DocumentStatus']>, ParentType, ContextType>
    kind?: Resolver<ResolversTypes['String'], ParentType, ContextType>
    meta?: Resolver<ResolversTypes['SykmeldingMeta'], ParentType, ContextType>
    sykmeldingId?: Resolver<ResolversTypes['String'], ParentType, ContextType>
    utfall?: Resolver<ResolversTypes['Outcome'], ParentType, ContextType>
    values?: Resolver<ResolversTypes['SykmeldingFullValues'], ParentType, ContextType>
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type SykmeldingFullValuesResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['SykmeldingFullValues'] = ResolversParentTypes['SykmeldingFullValues'],
> = {
    aktivitet?: Resolver<Array<ResolversTypes['Aktivitet']>, ParentType, ContextType>
    annenFravarsgrunn?: Resolver<Maybe<ResolversTypes['AnnenFravarsgrunnArsak']>, ParentType, ContextType>
    arbeidsgiver?: Resolver<Maybe<ResolversTypes['Arbeidsgiver']>, ParentType, ContextType>
    bidiagnoser?: Resolver<Maybe<Array<ResolversTypes['Diagnose']>>, ParentType, ContextType>
    hoveddiagnose?: Resolver<Maybe<ResolversTypes['Diagnose']>, ParentType, ContextType>
    meldinger?: Resolver<ResolversTypes['SykmeldingMelding'], ParentType, ContextType>
    pasientenSkalSkjermes?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
    svangerskapsrelatert?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
    tilbakedatering?: Resolver<Maybe<ResolversTypes['Tilbakedatering']>, ParentType, ContextType>
    utdypendeSporsmal?: Resolver<Maybe<ResolversTypes['UtdypendeSporsmal']>, ParentType, ContextType>
    yrkesskade?: Resolver<Maybe<ResolversTypes['Yrkesskade']>, ParentType, ContextType>
}

export type SykmeldingLightResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['SykmeldingLight'] = ResolversParentTypes['SykmeldingLight'],
> = {
    documentStatus?: Resolver<Maybe<ResolversTypes['DocumentStatus']>, ParentType, ContextType>
    kind?: Resolver<ResolversTypes['String'], ParentType, ContextType>
    meta?: Resolver<ResolversTypes['SykmeldingMeta'], ParentType, ContextType>
    sykmeldingId?: Resolver<ResolversTypes['String'], ParentType, ContextType>
    utfall?: Resolver<ResolversTypes['Outcome'], ParentType, ContextType>
    values?: Resolver<ResolversTypes['SykmeldingLightValues'], ParentType, ContextType>
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type SykmeldingLightValuesResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['SykmeldingLightValues'] = ResolversParentTypes['SykmeldingLightValues'],
> = {
    aktivitet?: Resolver<Array<ResolversTypes['Aktivitet']>, ParentType, ContextType>
    bidiagnoser?: Resolver<Maybe<Array<ResolversTypes['Diagnose']>>, ParentType, ContextType>
    hoveddiagnose?: Resolver<Maybe<ResolversTypes['Diagnose']>, ParentType, ContextType>
}

export type SykmeldingMeldingResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['SykmeldingMelding'] = ResolversParentTypes['SykmeldingMelding'],
> = {
    tilArbeidsgiver?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
    tilNav?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
}

export type SykmeldingMetaResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['SykmeldingMeta'] = ResolversParentTypes['SykmeldingMeta'],
> = {
    legekontorOrgnr?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
    mottatt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>
    pasientIdent?: Resolver<ResolversTypes['String'], ParentType, ContextType>
    sykmelderHpr?: Resolver<ResolversTypes['String'], ParentType, ContextType>
}

export type SykmeldingRedactedResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['SykmeldingRedacted'] = ResolversParentTypes['SykmeldingRedacted'],
> = {
    kind?: Resolver<ResolversTypes['String'], ParentType, ContextType>
    meta?: Resolver<ResolversTypes['SykmeldingMeta'], ParentType, ContextType>
    sykmeldingId?: Resolver<ResolversTypes['String'], ParentType, ContextType>
    utfall?: Resolver<ResolversTypes['Outcome'], ParentType, ContextType>
    values?: Resolver<ResolversTypes['SykmeldingRedactedValues'], ParentType, ContextType>
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type SykmeldingRedactedValuesResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['SykmeldingRedactedValues'] =
        ResolversParentTypes['SykmeldingRedactedValues'],
> = {
    aktivitet?: Resolver<Array<ResolversTypes['AktivitetRedacted']>, ParentType, ContextType>
}

export type SykmeldingValideringResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['SykmeldingValidering'] = ResolversParentTypes['SykmeldingValidering'],
> = {
    __resolveType: TypeResolveFn<'RuleOK' | 'RuleOutcome', ParentType, ContextType>
}

export type SykmeldingerResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['Sykmeldinger'] = ResolversParentTypes['Sykmeldinger'],
> = {
    current?: Resolver<Array<ResolversTypes['Sykmelding']>, ParentType, ContextType>
    historical?: Resolver<Array<ResolversTypes['Sykmelding']>, ParentType, ContextType>
}

export type SynchronizationStatusResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['SynchronizationStatus'] = ResolversParentTypes['SynchronizationStatus'],
> = {
    documentStatus?: Resolver<ResolversTypes['DocumentStatus'], ParentType, ContextType>
    navStatus?: Resolver<ResolversTypes['DocumentStatus'], ParentType, ContextType>
}

export type TilbakedateringResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['Tilbakedatering'] = ResolversParentTypes['Tilbakedatering'],
> = {
    begrunnelse?: Resolver<ResolversTypes['String'], ParentType, ContextType>
    startdato?: Resolver<ResolversTypes['DateOnly'], ParentType, ContextType>
}

export type UtdypendeOpplysningerHintResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['UtdypendeOpplysningerHint'] =
        ResolversParentTypes['UtdypendeOpplysningerHint'],
> = {
    days?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
    latestTom?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
    previouslyAnsweredSporsmal?: Resolver<Array<ResolversTypes['UtdypendeSporsmalOptions']>, ParentType, ContextType>
}

export type UtdypendeSporsmalResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['UtdypendeSporsmal'] = ResolversParentTypes['UtdypendeSporsmal'],
> = {
    hensynPaArbeidsplassen?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
    medisinskOppsummering?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
    utfordringerMedArbeid?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
}

export type YrkesskadeResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['Yrkesskade'] = ResolversParentTypes['Yrkesskade'],
> = {
    skadedato?: Resolver<Maybe<ResolversTypes['DateOnly']>, ParentType, ContextType>
    yrkesskade?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
}

export type Resolvers<ContextType = any> = {
    Aktivitet?: AktivitetResolvers<ContextType>
    AktivitetIkkeMulig?: AktivitetIkkeMuligResolvers<ContextType>
    AktivitetRedacted?: AktivitetRedactedResolvers<ContextType>
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
    OpprettetSykmelding?: OpprettetSykmeldingResolvers<ContextType>
    OtherSubmitOutcomes?: OtherSubmitOutcomesResolvers<ContextType>
    Outcome?: OutcomeResolvers<ContextType>
    Pasient?: PasientResolvers<ContextType>
    Person?: PersonResolvers<ContextType>
    QueriedPerson?: QueriedPersonResolvers<ContextType>
    Query?: QueryResolvers<ContextType>
    Reisetilskudd?: ReisetilskuddResolvers<ContextType>
    RuleOK?: RuleOkResolvers<ContextType>
    RuleOutcome?: RuleOutcomeResolvers<ContextType>
    Sykmelding?: SykmeldingResolvers<ContextType>
    SykmeldingBase?: SykmeldingBaseResolvers<ContextType>
    SykmeldingFull?: SykmeldingFullResolvers<ContextType>
    SykmeldingFullValues?: SykmeldingFullValuesResolvers<ContextType>
    SykmeldingLight?: SykmeldingLightResolvers<ContextType>
    SykmeldingLightValues?: SykmeldingLightValuesResolvers<ContextType>
    SykmeldingMelding?: SykmeldingMeldingResolvers<ContextType>
    SykmeldingMeta?: SykmeldingMetaResolvers<ContextType>
    SykmeldingRedacted?: SykmeldingRedactedResolvers<ContextType>
    SykmeldingRedactedValues?: SykmeldingRedactedValuesResolvers<ContextType>
    SykmeldingValidering?: SykmeldingValideringResolvers<ContextType>
    Sykmeldinger?: SykmeldingerResolvers<ContextType>
    SynchronizationStatus?: SynchronizationStatusResolvers<ContextType>
    Tilbakedatering?: TilbakedateringResolvers<ContextType>
    UtdypendeOpplysningerHint?: UtdypendeOpplysningerHintResolvers<ContextType>
    UtdypendeSporsmal?: UtdypendeSporsmalResolvers<ContextType>
    Yrkesskade?: YrkesskadeResolvers<ContextType>
}
