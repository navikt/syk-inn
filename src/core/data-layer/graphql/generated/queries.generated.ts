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
    DateOnly: { input: string; output: string }
    DateTime: { input: string; output: string }
    JSON: { input: unknown; output: unknown }
}

export type Aktivitet = AktivitetIkkeMulig | Avventende | Behandlingsdager | Gradert | Reisetilskudd

export type AktivitetIkkeMulig = FomTom & {
    __typename: 'AktivitetIkkeMulig'
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
    __typename: 'AktivitetRedacted'
    fom: Scalars['DateOnly']['output']
    tom: Scalars['DateOnly']['output']
    type: AktivitetType
}

export type AktivitetType = 'AKTIVITET_IKKE_MULIG' | 'AVVENTENDE' | 'BEHANDLINGSDAGER' | 'GRADERT' | 'REISETILSKUDD'

export type Arbeidsforhold = {
    __typename: 'Arbeidsforhold'
    navn: Scalars['String']['output']
    orgnummer: Scalars['String']['output']
}

export type Arbeidsgiver = {
    __typename: 'Arbeidsgiver'
    arbeidsgivernavn: Scalars['String']['output']
    harFlere: Scalars['Boolean']['output']
}

export type ArbeidsrelatertArsak = {
    __typename: 'ArbeidsrelatertArsak'
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
    __typename: 'Avventende'
    fom: Scalars['DateOnly']['output']
    innspillTilArbeidsgiver: Scalars['String']['output']
    tom: Scalars['DateOnly']['output']
    type: AktivitetType
}

export type AvventendeInput = {
    innspillTilArbeidsgiver: Scalars['String']['input']
}

export type Behandler = {
    __typename: 'Behandler'
    hpr: Scalars['String']['output']
    legekontorTlf?: Maybe<Scalars['String']['output']>
    navn: Scalars['String']['output']
    orgnummer?: Maybe<Scalars['String']['output']>
}

export type Behandlingsdager = FomTom & {
    __typename: 'Behandlingsdager'
    antallBehandlingsdager: Scalars['Int']['output']
    fom: Scalars['DateOnly']['output']
    tom: Scalars['DateOnly']['output']
    type: AktivitetType
}

export type BehandlingsdagerInput = {
    antallBehandlingsdager: Scalars['Int']['input']
}

export type Diagnose = {
    __typename: 'Diagnose'
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
    __typename: 'Gradert'
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
    utfodringerMedArbeid?: InputMaybe<Scalars['String']['input']>
}

export type InputYrkesskade = {
    skadedato?: InputMaybe<Scalars['DateOnly']['input']>
    yrkesskade: Scalars['Boolean']['input']
}

export type Konsultasjon = {
    __typename: 'Konsultasjon'
    diagnoser?: Maybe<Array<Diagnose>>
    hasRequestedAccessToSykmeldinger?: Maybe<Scalars['Boolean']['output']>
}

export type MedisinskArsak = {
    __typename: 'MedisinskArsak'
    isMedisinskArsak: Scalars['Boolean']['output']
}

export type MedisinskArsakInput = {
    isMedisinskArsak: Scalars['Boolean']['input']
}

export type Mutation = {
    __typename: 'Mutation'
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
    __typename: 'OpprettSykmeldingDraft'
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
    utdypendeSporsmal?: InputMaybe<InputUtdypendeSporsmal>
    yrkesskade?: InputMaybe<InputYrkesskade>
}

export type OpprettSykmeldingMetaInput = {
    legekontorTlf?: InputMaybe<Scalars['String']['input']>
    orgnummer?: InputMaybe<Scalars['String']['input']>
}

export type OpprettetSykmelding = OtherSubmitOutcomes | RuleOutcome | SykmeldingFull

export type OtherSubmitOutcomes = {
    __typename: 'OtherSubmitOutcomes'
    cause: OtherSubmitOutcomesEnum
}

export type OtherSubmitOutcomesEnum = 'MISSING_PRACTITIONER_INFO' | 'PATIENT_NOT_FOUND_IN_PDL'

export type Outcome = {
    __typename: 'Outcome'
    message?: Maybe<Scalars['String']['output']>
    result: Scalars['String']['output']
}

export type Pasient = Person & {
    __typename: 'Pasient'
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
    __typename: 'QueriedPerson'
    ident: Scalars['String']['output']
    navn: Scalars['String']['output']
}

export type Query = {
    __typename: 'Query'
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
    system: DiagnoseSystem
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
    __typename: 'Reisetilskudd'
    fom: Scalars['DateOnly']['output']
    tom: Scalars['DateOnly']['output']
    type: AktivitetType
}

export type ReisetilskuddInput = {
    dummy: Scalars['Boolean']['input']
}

export type RuleOk = {
    __typename: 'RuleOK'
    ok: Scalars['Boolean']['output']
}

export type RuleOutcome = {
    __typename: 'RuleOutcome'
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
    __typename: 'SykmeldingFull'
    /** Status on the document in the EHR system. */
    documentStatus?: Maybe<DocumentStatus>
    kind: Scalars['String']['output']
    meta: SykmeldingMeta
    sykmeldingId: Scalars['String']['output']
    utfall: Outcome
    values: SykmeldingFullValues
}

export type SykmeldingFullValues = {
    __typename: 'SykmeldingFullValues'
    aktivitet: Array<Aktivitet>
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
    __typename: 'SykmeldingLight'
    /** Status on the document in the EHR system. */
    documentStatus?: Maybe<DocumentStatus>
    kind: Scalars['String']['output']
    meta: SykmeldingMeta
    sykmeldingId: Scalars['String']['output']
    utfall: Outcome
    values: SykmeldingLightValues
}

export type SykmeldingLightValues = {
    __typename: 'SykmeldingLightValues'
    aktivitet: Array<Aktivitet>
    bidiagnoser?: Maybe<Array<Diagnose>>
    hoveddiagnose?: Maybe<Diagnose>
}

export type SykmeldingMelding = {
    __typename: 'SykmeldingMelding'
    tilArbeidsgiver?: Maybe<Scalars['String']['output']>
    tilNav?: Maybe<Scalars['String']['output']>
}

export type SykmeldingMeta = {
    __typename: 'SykmeldingMeta'
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
    __typename: 'SykmeldingRedacted'
    kind: Scalars['String']['output']
    meta: SykmeldingMeta
    sykmeldingId: Scalars['String']['output']
    utfall: Outcome
    values: SykmeldingRedactedValues
}

export type SykmeldingRedactedValues = {
    __typename: 'SykmeldingRedactedValues'
    aktivitet: Array<AktivitetRedacted>
}

export type SykmeldingValidering = RuleOk | RuleOutcome

export type Sykmeldinger = {
    __typename: 'Sykmeldinger'
    current: Array<Sykmelding>
    historical: Array<Sykmelding>
}

export type SynchronizationStatus = {
    __typename: 'SynchronizationStatus'
    documentStatus: DocumentStatus
    navStatus: DocumentStatus
}

export type Tilbakedatering = {
    __typename: 'Tilbakedatering'
    begrunnelse: Scalars['String']['output']
    startdato: Scalars['DateOnly']['output']
}

export type UtdypendeOpplysningerHint = {
    __typename: 'UtdypendeOpplysningerHint'
    days: Scalars['Int']['output']
    latestTom?: Maybe<Scalars['String']['output']>
    previouslyAnsweredSporsmal: Array<UtdypendeSporsmalOptions>
}

export type UtdypendeSporsmal = {
    __typename: 'UtdypendeSporsmal'
    hensynPaArbeidsplassen?: Maybe<Scalars['String']['output']>
    medisinskOppsummering?: Maybe<Scalars['String']['output']>
    utfodringerMedArbeid?: Maybe<Scalars['String']['output']>
}

export type UtdypendeSporsmalOptions = 'HENSYN_PA_ARBEIDSPLASSEN' | 'MEDISINSK_OPPSUMMERING' | 'UTFORDRINGER_MED_ARBEID'

export type Yrkesskade = {
    __typename: 'Yrkesskade'
    skadedato?: Maybe<Scalars['DateOnly']['output']>
    yrkesskade: Scalars['Boolean']['output']
}

type Person_Pasient_Fragment = { __typename: 'Pasient'; ident: string; navn: string }

type Person_QueriedPerson_Fragment = { __typename: 'QueriedPerson'; ident: string; navn: string }

export type PersonFragment = Person_Pasient_Fragment | Person_QueriedPerson_Fragment

export type AllDashboardQueryVariables = Exact<{ [key: string]: never }>

export type AllDashboardQuery = {
    __typename: 'Query'
    drafts?: Array<{
        __typename: 'OpprettSykmeldingDraft'
        draftId: string
        values: unknown
        lastUpdated: string
    }> | null
    sykmeldinger?: {
        __typename: 'Sykmeldinger'
        current: Array<
            | {
                  __typename: 'SykmeldingFull'
                  sykmeldingId: string
                  documentStatus?: DocumentStatus | null
                  meta: {
                      __typename: 'SykmeldingMeta'
                      pasientIdent: string
                      sykmelderHpr: string
                      legekontorOrgnr?: string | null
                      mottatt: string
                  }
                  utfall: { __typename: 'Outcome'; result: string; message?: string | null }
                  values: {
                      __typename: 'SykmeldingFullValues'
                      svangerskapsrelatert: boolean
                      pasientenSkalSkjermes: boolean
                      hoveddiagnose?: {
                          __typename: 'Diagnose'
                          system: DiagnoseSystem
                          code: string
                          text: string
                      } | null
                      bidiagnoser?: Array<{
                          __typename: 'Diagnose'
                          system: DiagnoseSystem
                          code: string
                          text: string
                      }> | null
                      aktivitet: Array<
                          | {
                                __typename: 'AktivitetIkkeMulig'
                                fom: string
                                tom: string
                                type: AktivitetType
                                arbeidsrelatertArsak?: {
                                    __typename: 'ArbeidsrelatertArsak'
                                    isArbeidsrelatertArsak: boolean
                                    arbeidsrelaterteArsaker: Array<ArbeidsrelatertArsakType>
                                    annenArbeidsrelatertArsak?: string | null
                                } | null
                                medisinskArsak?: { __typename: 'MedisinskArsak'; isMedisinskArsak: boolean } | null
                            }
                          | {
                                __typename: 'Avventende'
                                fom: string
                                tom: string
                                type: AktivitetType
                                innspillTilArbeidsgiver: string
                            }
                          | {
                                __typename: 'Behandlingsdager'
                                fom: string
                                tom: string
                                type: AktivitetType
                                antallBehandlingsdager: number
                            }
                          | { __typename: 'Gradert'; fom: string; tom: string; type: AktivitetType; grad: number }
                          | { __typename: 'Reisetilskudd'; fom: string; tom: string; type: AktivitetType }
                      >
                      arbeidsgiver?: { __typename: 'Arbeidsgiver'; harFlere: boolean; arbeidsgivernavn: string } | null
                      meldinger: {
                          __typename: 'SykmeldingMelding'
                          tilNav?: string | null
                          tilArbeidsgiver?: string | null
                      }
                      yrkesskade?: { __typename: 'Yrkesskade'; yrkesskade: boolean; skadedato?: string | null } | null
                      tilbakedatering?: { __typename: 'Tilbakedatering'; startdato: string; begrunnelse: string } | null
                      utdypendeSporsmal?: {
                          __typename: 'UtdypendeSporsmal'
                          utfodringerMedArbeid?: string | null
                          medisinskOppsummering?: string | null
                          hensynPaArbeidsplassen?: string | null
                      } | null
                  }
              }
            | {
                  __typename: 'SykmeldingLight'
                  sykmeldingId: string
                  documentStatus?: DocumentStatus | null
                  meta: {
                      __typename: 'SykmeldingMeta'
                      pasientIdent: string
                      sykmelderHpr: string
                      legekontorOrgnr?: string | null
                      mottatt: string
                  }
                  utfall: { __typename: 'Outcome'; result: string; message?: string | null }
                  values: {
                      __typename: 'SykmeldingLightValues'
                      hoveddiagnose?: {
                          __typename: 'Diagnose'
                          system: DiagnoseSystem
                          code: string
                          text: string
                      } | null
                      bidiagnoser?: Array<{
                          __typename: 'Diagnose'
                          system: DiagnoseSystem
                          code: string
                          text: string
                      }> | null
                      aktivitet: Array<
                          | {
                                __typename: 'AktivitetIkkeMulig'
                                fom: string
                                tom: string
                                type: AktivitetType
                                arbeidsrelatertArsak?: {
                                    __typename: 'ArbeidsrelatertArsak'
                                    isArbeidsrelatertArsak: boolean
                                    arbeidsrelaterteArsaker: Array<ArbeidsrelatertArsakType>
                                    annenArbeidsrelatertArsak?: string | null
                                } | null
                                medisinskArsak?: { __typename: 'MedisinskArsak'; isMedisinskArsak: boolean } | null
                            }
                          | {
                                __typename: 'Avventende'
                                fom: string
                                tom: string
                                type: AktivitetType
                                innspillTilArbeidsgiver: string
                            }
                          | {
                                __typename: 'Behandlingsdager'
                                fom: string
                                tom: string
                                type: AktivitetType
                                antallBehandlingsdager: number
                            }
                          | { __typename: 'Gradert'; fom: string; tom: string; type: AktivitetType; grad: number }
                          | { __typename: 'Reisetilskudd'; fom: string; tom: string; type: AktivitetType }
                      >
                  }
              }
            | {
                  __typename: 'SykmeldingRedacted'
                  sykmeldingId: string
                  meta: {
                      __typename: 'SykmeldingMeta'
                      pasientIdent: string
                      sykmelderHpr: string
                      legekontorOrgnr?: string | null
                      mottatt: string
                  }
                  utfall: { __typename: 'Outcome'; result: string; message?: string | null }
                  values: {
                      __typename: 'SykmeldingRedactedValues'
                      aktivitet: Array<{
                          __typename: 'AktivitetRedacted'
                          type: AktivitetType
                          fom: string
                          tom: string
                      }>
                  }
              }
        >
        historical: Array<
            | {
                  __typename: 'SykmeldingFull'
                  sykmeldingId: string
                  documentStatus?: DocumentStatus | null
                  meta: {
                      __typename: 'SykmeldingMeta'
                      pasientIdent: string
                      sykmelderHpr: string
                      legekontorOrgnr?: string | null
                      mottatt: string
                  }
                  utfall: { __typename: 'Outcome'; result: string; message?: string | null }
                  values: {
                      __typename: 'SykmeldingFullValues'
                      svangerskapsrelatert: boolean
                      pasientenSkalSkjermes: boolean
                      hoveddiagnose?: {
                          __typename: 'Diagnose'
                          system: DiagnoseSystem
                          code: string
                          text: string
                      } | null
                      bidiagnoser?: Array<{
                          __typename: 'Diagnose'
                          system: DiagnoseSystem
                          code: string
                          text: string
                      }> | null
                      aktivitet: Array<
                          | {
                                __typename: 'AktivitetIkkeMulig'
                                fom: string
                                tom: string
                                type: AktivitetType
                                arbeidsrelatertArsak?: {
                                    __typename: 'ArbeidsrelatertArsak'
                                    isArbeidsrelatertArsak: boolean
                                    arbeidsrelaterteArsaker: Array<ArbeidsrelatertArsakType>
                                    annenArbeidsrelatertArsak?: string | null
                                } | null
                                medisinskArsak?: { __typename: 'MedisinskArsak'; isMedisinskArsak: boolean } | null
                            }
                          | {
                                __typename: 'Avventende'
                                fom: string
                                tom: string
                                type: AktivitetType
                                innspillTilArbeidsgiver: string
                            }
                          | {
                                __typename: 'Behandlingsdager'
                                fom: string
                                tom: string
                                type: AktivitetType
                                antallBehandlingsdager: number
                            }
                          | { __typename: 'Gradert'; fom: string; tom: string; type: AktivitetType; grad: number }
                          | { __typename: 'Reisetilskudd'; fom: string; tom: string; type: AktivitetType }
                      >
                      arbeidsgiver?: { __typename: 'Arbeidsgiver'; harFlere: boolean; arbeidsgivernavn: string } | null
                      meldinger: {
                          __typename: 'SykmeldingMelding'
                          tilNav?: string | null
                          tilArbeidsgiver?: string | null
                      }
                      yrkesskade?: { __typename: 'Yrkesskade'; yrkesskade: boolean; skadedato?: string | null } | null
                      tilbakedatering?: { __typename: 'Tilbakedatering'; startdato: string; begrunnelse: string } | null
                      utdypendeSporsmal?: {
                          __typename: 'UtdypendeSporsmal'
                          utfodringerMedArbeid?: string | null
                          medisinskOppsummering?: string | null
                          hensynPaArbeidsplassen?: string | null
                      } | null
                  }
              }
            | {
                  __typename: 'SykmeldingLight'
                  sykmeldingId: string
                  documentStatus?: DocumentStatus | null
                  meta: {
                      __typename: 'SykmeldingMeta'
                      pasientIdent: string
                      sykmelderHpr: string
                      legekontorOrgnr?: string | null
                      mottatt: string
                  }
                  utfall: { __typename: 'Outcome'; result: string; message?: string | null }
                  values: {
                      __typename: 'SykmeldingLightValues'
                      hoveddiagnose?: {
                          __typename: 'Diagnose'
                          system: DiagnoseSystem
                          code: string
                          text: string
                      } | null
                      bidiagnoser?: Array<{
                          __typename: 'Diagnose'
                          system: DiagnoseSystem
                          code: string
                          text: string
                      }> | null
                      aktivitet: Array<
                          | {
                                __typename: 'AktivitetIkkeMulig'
                                fom: string
                                tom: string
                                type: AktivitetType
                                arbeidsrelatertArsak?: {
                                    __typename: 'ArbeidsrelatertArsak'
                                    isArbeidsrelatertArsak: boolean
                                    arbeidsrelaterteArsaker: Array<ArbeidsrelatertArsakType>
                                    annenArbeidsrelatertArsak?: string | null
                                } | null
                                medisinskArsak?: { __typename: 'MedisinskArsak'; isMedisinskArsak: boolean } | null
                            }
                          | {
                                __typename: 'Avventende'
                                fom: string
                                tom: string
                                type: AktivitetType
                                innspillTilArbeidsgiver: string
                            }
                          | {
                                __typename: 'Behandlingsdager'
                                fom: string
                                tom: string
                                type: AktivitetType
                                antallBehandlingsdager: number
                            }
                          | { __typename: 'Gradert'; fom: string; tom: string; type: AktivitetType; grad: number }
                          | { __typename: 'Reisetilskudd'; fom: string; tom: string; type: AktivitetType }
                      >
                  }
              }
            | {
                  __typename: 'SykmeldingRedacted'
                  sykmeldingId: string
                  meta: {
                      __typename: 'SykmeldingMeta'
                      pasientIdent: string
                      sykmelderHpr: string
                      legekontorOrgnr?: string | null
                      mottatt: string
                  }
                  utfall: { __typename: 'Outcome'; result: string; message?: string | null }
                  values: {
                      __typename: 'SykmeldingRedactedValues'
                      aktivitet: Array<{
                          __typename: 'AktivitetRedacted'
                          type: AktivitetType
                          fom: string
                          tom: string
                      }>
                  }
              }
        >
    } | null
    konsultasjon?: {
        __typename: 'Konsultasjon'
        hasRequestedAccessToSykmeldinger?: boolean | null
        diagnoser?: Array<{ __typename: 'Diagnose'; system: DiagnoseSystem; code: string; text: string }> | null
    } | null
}

export type DiagnoseSearchQueryVariables = Exact<{
    query: Scalars['String']['input']
}>

export type DiagnoseSearchQuery = {
    __typename: 'Query'
    diagnose?: Array<{ __typename: 'Diagnose'; system: DiagnoseSystem; code: string; text: string }> | null
}

export type DiagnoseFragment = { __typename: 'Diagnose'; system: DiagnoseSystem; code: string; text: string }

export type SaveDraftMutationVariables = Exact<{
    draftId: Scalars['String']['input']
    values: Scalars['JSON']['input']
}>

export type SaveDraftMutation = {
    __typename: 'Mutation'
    saveDraft: { __typename: 'OpprettSykmeldingDraft'; draftId: string; values: unknown; lastUpdated: string }
}

export type DeleteDraftMutationVariables = Exact<{
    draftId: Scalars['String']['input']
}>

export type DeleteDraftMutation = { __typename: 'Mutation'; deleteDraft: boolean }

export type GetDraftQueryVariables = Exact<{
    draftId: Scalars['String']['input']
}>

export type GetDraftQuery = {
    __typename: 'Query'
    draft?: { __typename: 'OpprettSykmeldingDraft'; draftId: string; values: unknown; lastUpdated: string } | null
}

export type GetAllDraftsQueryVariables = Exact<{ [key: string]: never }>

export type GetAllDraftsQuery = {
    __typename: 'Query'
    drafts?: Array<{
        __typename: 'OpprettSykmeldingDraft'
        draftId: string
        values: unknown
        lastUpdated: string
    }> | null
}

export type DraftFragment = {
    __typename: 'OpprettSykmeldingDraft'
    draftId: string
    values: unknown
    lastUpdated: string
}

export type KonsultasjonFragment = {
    __typename: 'Konsultasjon'
    hasRequestedAccessToSykmeldinger?: boolean | null
    diagnoser?: Array<{ __typename: 'Diagnose'; system: DiagnoseSystem; code: string; text: string }> | null
}

export type KonsultasjonQueryVariables = Exact<{ [key: string]: never }>

export type KonsultasjonQuery = {
    __typename: 'Query'
    konsultasjon?: {
        __typename: 'Konsultasjon'
        hasRequestedAccessToSykmeldinger?: boolean | null
        diagnoser?: Array<{ __typename: 'Diagnose'; system: DiagnoseSystem; code: string; text: string }> | null
    } | null
}

export type BehandlerQueryVariables = Exact<{ [key: string]: never }>

export type BehandlerQuery = {
    __typename: 'Query'
    behandler?: {
        __typename: 'Behandler'
        navn: string
        hpr: string
        orgnummer?: string | null
        legekontorTlf?: string | null
    } | null
}

export type PasientQueryVariables = Exact<{ [key: string]: never }>

export type PasientQuery = {
    __typename: 'Query'
    pasient?: {
        __typename: 'Pasient'
        ident: string
        navn: string
        utdypendeSporsmal?: {
            __typename: 'UtdypendeOpplysningerHint'
            days: number
            latestTom?: string | null
            previouslyAnsweredSporsmal: Array<UtdypendeSporsmalOptions>
        } | null
    } | null
}

export type PasientWithExistsQueryVariables = Exact<{ [key: string]: never }>

export type PasientWithExistsQuery = {
    __typename: 'Query'
    pasient?: { __typename: 'Pasient'; userExists?: boolean | null; ident: string; navn: string } | null
}

export type ArbeidsforholdQueryVariables = Exact<{ [key: string]: never }>

export type ArbeidsforholdQuery = {
    __typename: 'Query'
    pasient?: {
        __typename: 'Pasient'
        ident: string
        arbeidsforhold?: Array<{ __typename: 'Arbeidsforhold'; navn: string; orgnummer: string }> | null
    } | null
}

export type PersonByIdentQueryVariables = Exact<{
    ident?: InputMaybe<Scalars['String']['input']>
}>

export type PersonByIdentQuery = {
    __typename: 'Query'
    person?: { __typename: 'QueriedPerson'; ident: string; navn: string } | null
}

export type SykmeldingByIdQueryVariables = Exact<{
    id: Scalars['String']['input']
}>

export type SykmeldingByIdQuery = {
    __typename: 'Query'
    sykmelding?:
        | {
              __typename: 'SykmeldingFull'
              sykmeldingId: string
              documentStatus?: DocumentStatus | null
              meta: {
                  __typename: 'SykmeldingMeta'
                  pasientIdent: string
                  sykmelderHpr: string
                  legekontorOrgnr?: string | null
                  mottatt: string
              }
              utfall: { __typename: 'Outcome'; result: string; message?: string | null }
              values: {
                  __typename: 'SykmeldingFullValues'
                  svangerskapsrelatert: boolean
                  pasientenSkalSkjermes: boolean
                  hoveddiagnose?: { __typename: 'Diagnose'; system: DiagnoseSystem; code: string; text: string } | null
                  bidiagnoser?: Array<{
                      __typename: 'Diagnose'
                      system: DiagnoseSystem
                      code: string
                      text: string
                  }> | null
                  aktivitet: Array<
                      | {
                            __typename: 'AktivitetIkkeMulig'
                            fom: string
                            tom: string
                            type: AktivitetType
                            arbeidsrelatertArsak?: {
                                __typename: 'ArbeidsrelatertArsak'
                                isArbeidsrelatertArsak: boolean
                                arbeidsrelaterteArsaker: Array<ArbeidsrelatertArsakType>
                                annenArbeidsrelatertArsak?: string | null
                            } | null
                            medisinskArsak?: { __typename: 'MedisinskArsak'; isMedisinskArsak: boolean } | null
                        }
                      | {
                            __typename: 'Avventende'
                            fom: string
                            tom: string
                            type: AktivitetType
                            innspillTilArbeidsgiver: string
                        }
                      | {
                            __typename: 'Behandlingsdager'
                            fom: string
                            tom: string
                            type: AktivitetType
                            antallBehandlingsdager: number
                        }
                      | { __typename: 'Gradert'; fom: string; tom: string; type: AktivitetType; grad: number }
                      | { __typename: 'Reisetilskudd'; fom: string; tom: string; type: AktivitetType }
                  >
                  arbeidsgiver?: { __typename: 'Arbeidsgiver'; harFlere: boolean; arbeidsgivernavn: string } | null
                  meldinger: {
                      __typename: 'SykmeldingMelding'
                      tilNav?: string | null
                      tilArbeidsgiver?: string | null
                  }
                  yrkesskade?: { __typename: 'Yrkesskade'; yrkesskade: boolean; skadedato?: string | null } | null
                  tilbakedatering?: { __typename: 'Tilbakedatering'; startdato: string; begrunnelse: string } | null
                  utdypendeSporsmal?: {
                      __typename: 'UtdypendeSporsmal'
                      utfodringerMedArbeid?: string | null
                      medisinskOppsummering?: string | null
                      hensynPaArbeidsplassen?: string | null
                  } | null
              }
          }
        | {
              __typename: 'SykmeldingLight'
              sykmeldingId: string
              documentStatus?: DocumentStatus | null
              meta: {
                  __typename: 'SykmeldingMeta'
                  pasientIdent: string
                  sykmelderHpr: string
                  legekontorOrgnr?: string | null
                  mottatt: string
              }
              utfall: { __typename: 'Outcome'; result: string; message?: string | null }
              values: {
                  __typename: 'SykmeldingLightValues'
                  hoveddiagnose?: { __typename: 'Diagnose'; system: DiagnoseSystem; code: string; text: string } | null
                  bidiagnoser?: Array<{
                      __typename: 'Diagnose'
                      system: DiagnoseSystem
                      code: string
                      text: string
                  }> | null
                  aktivitet: Array<
                      | {
                            __typename: 'AktivitetIkkeMulig'
                            fom: string
                            tom: string
                            type: AktivitetType
                            arbeidsrelatertArsak?: {
                                __typename: 'ArbeidsrelatertArsak'
                                isArbeidsrelatertArsak: boolean
                                arbeidsrelaterteArsaker: Array<ArbeidsrelatertArsakType>
                                annenArbeidsrelatertArsak?: string | null
                            } | null
                            medisinskArsak?: { __typename: 'MedisinskArsak'; isMedisinskArsak: boolean } | null
                        }
                      | {
                            __typename: 'Avventende'
                            fom: string
                            tom: string
                            type: AktivitetType
                            innspillTilArbeidsgiver: string
                        }
                      | {
                            __typename: 'Behandlingsdager'
                            fom: string
                            tom: string
                            type: AktivitetType
                            antallBehandlingsdager: number
                        }
                      | { __typename: 'Gradert'; fom: string; tom: string; type: AktivitetType; grad: number }
                      | { __typename: 'Reisetilskudd'; fom: string; tom: string; type: AktivitetType }
                  >
              }
          }
        | {
              __typename: 'SykmeldingRedacted'
              sykmeldingId: string
              meta: {
                  __typename: 'SykmeldingMeta'
                  pasientIdent: string
                  sykmelderHpr: string
                  legekontorOrgnr?: string | null
                  mottatt: string
              }
              utfall: { __typename: 'Outcome'; result: string; message?: string | null }
              values: {
                  __typename: 'SykmeldingRedactedValues'
                  aktivitet: Array<{ __typename: 'AktivitetRedacted'; type: AktivitetType; fom: string; tom: string }>
              }
          }
        | null
}

export type AllSykmeldingerQueryVariables = Exact<{ [key: string]: never }>

export type AllSykmeldingerQuery = {
    __typename: 'Query'
    sykmeldinger?: {
        __typename: 'Sykmeldinger'
        current: Array<
            | {
                  __typename: 'SykmeldingFull'
                  sykmeldingId: string
                  documentStatus?: DocumentStatus | null
                  meta: {
                      __typename: 'SykmeldingMeta'
                      pasientIdent: string
                      sykmelderHpr: string
                      legekontorOrgnr?: string | null
                      mottatt: string
                  }
                  utfall: { __typename: 'Outcome'; result: string; message?: string | null }
                  values: {
                      __typename: 'SykmeldingFullValues'
                      svangerskapsrelatert: boolean
                      pasientenSkalSkjermes: boolean
                      hoveddiagnose?: {
                          __typename: 'Diagnose'
                          system: DiagnoseSystem
                          code: string
                          text: string
                      } | null
                      bidiagnoser?: Array<{
                          __typename: 'Diagnose'
                          system: DiagnoseSystem
                          code: string
                          text: string
                      }> | null
                      aktivitet: Array<
                          | {
                                __typename: 'AktivitetIkkeMulig'
                                fom: string
                                tom: string
                                type: AktivitetType
                                arbeidsrelatertArsak?: {
                                    __typename: 'ArbeidsrelatertArsak'
                                    isArbeidsrelatertArsak: boolean
                                    arbeidsrelaterteArsaker: Array<ArbeidsrelatertArsakType>
                                    annenArbeidsrelatertArsak?: string | null
                                } | null
                                medisinskArsak?: { __typename: 'MedisinskArsak'; isMedisinskArsak: boolean } | null
                            }
                          | {
                                __typename: 'Avventende'
                                fom: string
                                tom: string
                                type: AktivitetType
                                innspillTilArbeidsgiver: string
                            }
                          | {
                                __typename: 'Behandlingsdager'
                                fom: string
                                tom: string
                                type: AktivitetType
                                antallBehandlingsdager: number
                            }
                          | { __typename: 'Gradert'; fom: string; tom: string; type: AktivitetType; grad: number }
                          | { __typename: 'Reisetilskudd'; fom: string; tom: string; type: AktivitetType }
                      >
                      arbeidsgiver?: { __typename: 'Arbeidsgiver'; harFlere: boolean; arbeidsgivernavn: string } | null
                      meldinger: {
                          __typename: 'SykmeldingMelding'
                          tilNav?: string | null
                          tilArbeidsgiver?: string | null
                      }
                      yrkesskade?: { __typename: 'Yrkesskade'; yrkesskade: boolean; skadedato?: string | null } | null
                      tilbakedatering?: { __typename: 'Tilbakedatering'; startdato: string; begrunnelse: string } | null
                      utdypendeSporsmal?: {
                          __typename: 'UtdypendeSporsmal'
                          utfodringerMedArbeid?: string | null
                          medisinskOppsummering?: string | null
                          hensynPaArbeidsplassen?: string | null
                      } | null
                  }
              }
            | {
                  __typename: 'SykmeldingLight'
                  sykmeldingId: string
                  documentStatus?: DocumentStatus | null
                  meta: {
                      __typename: 'SykmeldingMeta'
                      pasientIdent: string
                      sykmelderHpr: string
                      legekontorOrgnr?: string | null
                      mottatt: string
                  }
                  utfall: { __typename: 'Outcome'; result: string; message?: string | null }
                  values: {
                      __typename: 'SykmeldingLightValues'
                      hoveddiagnose?: {
                          __typename: 'Diagnose'
                          system: DiagnoseSystem
                          code: string
                          text: string
                      } | null
                      bidiagnoser?: Array<{
                          __typename: 'Diagnose'
                          system: DiagnoseSystem
                          code: string
                          text: string
                      }> | null
                      aktivitet: Array<
                          | {
                                __typename: 'AktivitetIkkeMulig'
                                fom: string
                                tom: string
                                type: AktivitetType
                                arbeidsrelatertArsak?: {
                                    __typename: 'ArbeidsrelatertArsak'
                                    isArbeidsrelatertArsak: boolean
                                    arbeidsrelaterteArsaker: Array<ArbeidsrelatertArsakType>
                                    annenArbeidsrelatertArsak?: string | null
                                } | null
                                medisinskArsak?: { __typename: 'MedisinskArsak'; isMedisinskArsak: boolean } | null
                            }
                          | {
                                __typename: 'Avventende'
                                fom: string
                                tom: string
                                type: AktivitetType
                                innspillTilArbeidsgiver: string
                            }
                          | {
                                __typename: 'Behandlingsdager'
                                fom: string
                                tom: string
                                type: AktivitetType
                                antallBehandlingsdager: number
                            }
                          | { __typename: 'Gradert'; fom: string; tom: string; type: AktivitetType; grad: number }
                          | { __typename: 'Reisetilskudd'; fom: string; tom: string; type: AktivitetType }
                      >
                  }
              }
            | {
                  __typename: 'SykmeldingRedacted'
                  sykmeldingId: string
                  meta: {
                      __typename: 'SykmeldingMeta'
                      pasientIdent: string
                      sykmelderHpr: string
                      legekontorOrgnr?: string | null
                      mottatt: string
                  }
                  utfall: { __typename: 'Outcome'; result: string; message?: string | null }
                  values: {
                      __typename: 'SykmeldingRedactedValues'
                      aktivitet: Array<{
                          __typename: 'AktivitetRedacted'
                          type: AktivitetType
                          fom: string
                          tom: string
                      }>
                  }
              }
        >
        historical: Array<
            | {
                  __typename: 'SykmeldingFull'
                  sykmeldingId: string
                  documentStatus?: DocumentStatus | null
                  meta: {
                      __typename: 'SykmeldingMeta'
                      pasientIdent: string
                      sykmelderHpr: string
                      legekontorOrgnr?: string | null
                      mottatt: string
                  }
                  utfall: { __typename: 'Outcome'; result: string; message?: string | null }
                  values: {
                      __typename: 'SykmeldingFullValues'
                      svangerskapsrelatert: boolean
                      pasientenSkalSkjermes: boolean
                      hoveddiagnose?: {
                          __typename: 'Diagnose'
                          system: DiagnoseSystem
                          code: string
                          text: string
                      } | null
                      bidiagnoser?: Array<{
                          __typename: 'Diagnose'
                          system: DiagnoseSystem
                          code: string
                          text: string
                      }> | null
                      aktivitet: Array<
                          | {
                                __typename: 'AktivitetIkkeMulig'
                                fom: string
                                tom: string
                                type: AktivitetType
                                arbeidsrelatertArsak?: {
                                    __typename: 'ArbeidsrelatertArsak'
                                    isArbeidsrelatertArsak: boolean
                                    arbeidsrelaterteArsaker: Array<ArbeidsrelatertArsakType>
                                    annenArbeidsrelatertArsak?: string | null
                                } | null
                                medisinskArsak?: { __typename: 'MedisinskArsak'; isMedisinskArsak: boolean } | null
                            }
                          | {
                                __typename: 'Avventende'
                                fom: string
                                tom: string
                                type: AktivitetType
                                innspillTilArbeidsgiver: string
                            }
                          | {
                                __typename: 'Behandlingsdager'
                                fom: string
                                tom: string
                                type: AktivitetType
                                antallBehandlingsdager: number
                            }
                          | { __typename: 'Gradert'; fom: string; tom: string; type: AktivitetType; grad: number }
                          | { __typename: 'Reisetilskudd'; fom: string; tom: string; type: AktivitetType }
                      >
                      arbeidsgiver?: { __typename: 'Arbeidsgiver'; harFlere: boolean; arbeidsgivernavn: string } | null
                      meldinger: {
                          __typename: 'SykmeldingMelding'
                          tilNav?: string | null
                          tilArbeidsgiver?: string | null
                      }
                      yrkesskade?: { __typename: 'Yrkesskade'; yrkesskade: boolean; skadedato?: string | null } | null
                      tilbakedatering?: { __typename: 'Tilbakedatering'; startdato: string; begrunnelse: string } | null
                      utdypendeSporsmal?: {
                          __typename: 'UtdypendeSporsmal'
                          utfodringerMedArbeid?: string | null
                          medisinskOppsummering?: string | null
                          hensynPaArbeidsplassen?: string | null
                      } | null
                  }
              }
            | {
                  __typename: 'SykmeldingLight'
                  sykmeldingId: string
                  documentStatus?: DocumentStatus | null
                  meta: {
                      __typename: 'SykmeldingMeta'
                      pasientIdent: string
                      sykmelderHpr: string
                      legekontorOrgnr?: string | null
                      mottatt: string
                  }
                  utfall: { __typename: 'Outcome'; result: string; message?: string | null }
                  values: {
                      __typename: 'SykmeldingLightValues'
                      hoveddiagnose?: {
                          __typename: 'Diagnose'
                          system: DiagnoseSystem
                          code: string
                          text: string
                      } | null
                      bidiagnoser?: Array<{
                          __typename: 'Diagnose'
                          system: DiagnoseSystem
                          code: string
                          text: string
                      }> | null
                      aktivitet: Array<
                          | {
                                __typename: 'AktivitetIkkeMulig'
                                fom: string
                                tom: string
                                type: AktivitetType
                                arbeidsrelatertArsak?: {
                                    __typename: 'ArbeidsrelatertArsak'
                                    isArbeidsrelatertArsak: boolean
                                    arbeidsrelaterteArsaker: Array<ArbeidsrelatertArsakType>
                                    annenArbeidsrelatertArsak?: string | null
                                } | null
                                medisinskArsak?: { __typename: 'MedisinskArsak'; isMedisinskArsak: boolean } | null
                            }
                          | {
                                __typename: 'Avventende'
                                fom: string
                                tom: string
                                type: AktivitetType
                                innspillTilArbeidsgiver: string
                            }
                          | {
                                __typename: 'Behandlingsdager'
                                fom: string
                                tom: string
                                type: AktivitetType
                                antallBehandlingsdager: number
                            }
                          | { __typename: 'Gradert'; fom: string; tom: string; type: AktivitetType; grad: number }
                          | { __typename: 'Reisetilskudd'; fom: string; tom: string; type: AktivitetType }
                      >
                  }
              }
            | {
                  __typename: 'SykmeldingRedacted'
                  sykmeldingId: string
                  meta: {
                      __typename: 'SykmeldingMeta'
                      pasientIdent: string
                      sykmelderHpr: string
                      legekontorOrgnr?: string | null
                      mottatt: string
                  }
                  utfall: { __typename: 'Outcome'; result: string; message?: string | null }
                  values: {
                      __typename: 'SykmeldingRedactedValues'
                      aktivitet: Array<{
                          __typename: 'AktivitetRedacted'
                          type: AktivitetType
                          fom: string
                          tom: string
                      }>
                  }
              }
        >
    } | null
}

export type OpprettSykmeldingMutationVariables = Exact<{
    draftId: Scalars['String']['input']
    meta: OpprettSykmeldingMetaInput
    values: OpprettSykmeldingInput
    force?: Scalars['Boolean']['input']
}>

export type OpprettSykmeldingMutation = {
    __typename: 'Mutation'
    opprettSykmelding:
        | { __typename: 'OtherSubmitOutcomes'; cause: OtherSubmitOutcomesEnum }
        | { __typename: 'RuleOutcome'; status: RuleOutcomeStatus; message: string; rule: string; tree: string }
        | {
              __typename: 'SykmeldingFull'
              sykmeldingId: string
              documentStatus?: DocumentStatus | null
              meta: {
                  __typename: 'SykmeldingMeta'
                  pasientIdent: string
                  sykmelderHpr: string
                  legekontorOrgnr?: string | null
                  mottatt: string
              }
              utfall: { __typename: 'Outcome'; result: string; message?: string | null }
              values: {
                  __typename: 'SykmeldingFullValues'
                  svangerskapsrelatert: boolean
                  pasientenSkalSkjermes: boolean
                  hoveddiagnose?: { __typename: 'Diagnose'; system: DiagnoseSystem; code: string; text: string } | null
                  bidiagnoser?: Array<{
                      __typename: 'Diagnose'
                      system: DiagnoseSystem
                      code: string
                      text: string
                  }> | null
                  aktivitet: Array<
                      | {
                            __typename: 'AktivitetIkkeMulig'
                            fom: string
                            tom: string
                            type: AktivitetType
                            arbeidsrelatertArsak?: {
                                __typename: 'ArbeidsrelatertArsak'
                                isArbeidsrelatertArsak: boolean
                                arbeidsrelaterteArsaker: Array<ArbeidsrelatertArsakType>
                                annenArbeidsrelatertArsak?: string | null
                            } | null
                            medisinskArsak?: { __typename: 'MedisinskArsak'; isMedisinskArsak: boolean } | null
                        }
                      | {
                            __typename: 'Avventende'
                            fom: string
                            tom: string
                            type: AktivitetType
                            innspillTilArbeidsgiver: string
                        }
                      | {
                            __typename: 'Behandlingsdager'
                            fom: string
                            tom: string
                            type: AktivitetType
                            antallBehandlingsdager: number
                        }
                      | { __typename: 'Gradert'; fom: string; tom: string; type: AktivitetType; grad: number }
                      | { __typename: 'Reisetilskudd'; fom: string; tom: string; type: AktivitetType }
                  >
                  arbeidsgiver?: { __typename: 'Arbeidsgiver'; harFlere: boolean; arbeidsgivernavn: string } | null
                  meldinger: {
                      __typename: 'SykmeldingMelding'
                      tilNav?: string | null
                      tilArbeidsgiver?: string | null
                  }
                  yrkesskade?: { __typename: 'Yrkesskade'; yrkesskade: boolean; skadedato?: string | null } | null
                  tilbakedatering?: { __typename: 'Tilbakedatering'; startdato: string; begrunnelse: string } | null
                  utdypendeSporsmal?: {
                      __typename: 'UtdypendeSporsmal'
                      utfodringerMedArbeid?: string | null
                      medisinskOppsummering?: string | null
                      hensynPaArbeidsplassen?: string | null
                  } | null
              }
          }
}

export type RuleOutcomeFragment = {
    __typename: 'RuleOutcome'
    status: RuleOutcomeStatus
    message: string
    rule: string
    tree: string
}

export type SykmeldingRedactedFragment = {
    __typename: 'SykmeldingRedacted'
    sykmeldingId: string
    meta: {
        __typename: 'SykmeldingMeta'
        pasientIdent: string
        sykmelderHpr: string
        legekontorOrgnr?: string | null
        mottatt: string
    }
    utfall: { __typename: 'Outcome'; result: string; message?: string | null }
    values: {
        __typename: 'SykmeldingRedactedValues'
        aktivitet: Array<{ __typename: 'AktivitetRedacted'; type: AktivitetType; fom: string; tom: string }>
    }
}

export type SykmeldingFullFragment = {
    __typename: 'SykmeldingFull'
    sykmeldingId: string
    documentStatus?: DocumentStatus | null
    meta: {
        __typename: 'SykmeldingMeta'
        pasientIdent: string
        sykmelderHpr: string
        legekontorOrgnr?: string | null
        mottatt: string
    }
    utfall: { __typename: 'Outcome'; result: string; message?: string | null }
    values: {
        __typename: 'SykmeldingFullValues'
        svangerskapsrelatert: boolean
        pasientenSkalSkjermes: boolean
        hoveddiagnose?: { __typename: 'Diagnose'; system: DiagnoseSystem; code: string; text: string } | null
        bidiagnoser?: Array<{ __typename: 'Diagnose'; system: DiagnoseSystem; code: string; text: string }> | null
        aktivitet: Array<
            | {
                  __typename: 'AktivitetIkkeMulig'
                  fom: string
                  tom: string
                  type: AktivitetType
                  arbeidsrelatertArsak?: {
                      __typename: 'ArbeidsrelatertArsak'
                      isArbeidsrelatertArsak: boolean
                      arbeidsrelaterteArsaker: Array<ArbeidsrelatertArsakType>
                      annenArbeidsrelatertArsak?: string | null
                  } | null
                  medisinskArsak?: { __typename: 'MedisinskArsak'; isMedisinskArsak: boolean } | null
              }
            | {
                  __typename: 'Avventende'
                  fom: string
                  tom: string
                  type: AktivitetType
                  innspillTilArbeidsgiver: string
              }
            | {
                  __typename: 'Behandlingsdager'
                  fom: string
                  tom: string
                  type: AktivitetType
                  antallBehandlingsdager: number
              }
            | { __typename: 'Gradert'; fom: string; tom: string; type: AktivitetType; grad: number }
            | { __typename: 'Reisetilskudd'; fom: string; tom: string; type: AktivitetType }
        >
        arbeidsgiver?: { __typename: 'Arbeidsgiver'; harFlere: boolean; arbeidsgivernavn: string } | null
        meldinger: { __typename: 'SykmeldingMelding'; tilNav?: string | null; tilArbeidsgiver?: string | null }
        yrkesskade?: { __typename: 'Yrkesskade'; yrkesskade: boolean; skadedato?: string | null } | null
        tilbakedatering?: { __typename: 'Tilbakedatering'; startdato: string; begrunnelse: string } | null
        utdypendeSporsmal?: {
            __typename: 'UtdypendeSporsmal'
            utfodringerMedArbeid?: string | null
            medisinskOppsummering?: string | null
            hensynPaArbeidsplassen?: string | null
        } | null
    }
}

export type SykmeldingLightFragment = {
    __typename: 'SykmeldingLight'
    sykmeldingId: string
    documentStatus?: DocumentStatus | null
    meta: {
        __typename: 'SykmeldingMeta'
        pasientIdent: string
        sykmelderHpr: string
        legekontorOrgnr?: string | null
        mottatt: string
    }
    utfall: { __typename: 'Outcome'; result: string; message?: string | null }
    values: {
        __typename: 'SykmeldingLightValues'
        hoveddiagnose?: { __typename: 'Diagnose'; system: DiagnoseSystem; code: string; text: string } | null
        bidiagnoser?: Array<{ __typename: 'Diagnose'; system: DiagnoseSystem; code: string; text: string }> | null
        aktivitet: Array<
            | {
                  __typename: 'AktivitetIkkeMulig'
                  fom: string
                  tom: string
                  type: AktivitetType
                  arbeidsrelatertArsak?: {
                      __typename: 'ArbeidsrelatertArsak'
                      isArbeidsrelatertArsak: boolean
                      arbeidsrelaterteArsaker: Array<ArbeidsrelatertArsakType>
                      annenArbeidsrelatertArsak?: string | null
                  } | null
                  medisinskArsak?: { __typename: 'MedisinskArsak'; isMedisinskArsak: boolean } | null
              }
            | {
                  __typename: 'Avventende'
                  fom: string
                  tom: string
                  type: AktivitetType
                  innspillTilArbeidsgiver: string
              }
            | {
                  __typename: 'Behandlingsdager'
                  fom: string
                  tom: string
                  type: AktivitetType
                  antallBehandlingsdager: number
              }
            | { __typename: 'Gradert'; fom: string; tom: string; type: AktivitetType; grad: number }
            | { __typename: 'Reisetilskudd'; fom: string; tom: string; type: AktivitetType }
        >
    }
}

export type RequestAccessToSykmeldingerMutationVariables = Exact<{ [key: string]: never }>

export type RequestAccessToSykmeldingerMutation = { __typename: 'Mutation'; requestAccessToSykmeldinger: boolean }

type Sykmelding_SykmeldingFull_Fragment = {
    __typename: 'SykmeldingFull'
    sykmeldingId: string
    documentStatus?: DocumentStatus | null
    meta: {
        __typename: 'SykmeldingMeta'
        pasientIdent: string
        sykmelderHpr: string
        legekontorOrgnr?: string | null
        mottatt: string
    }
    utfall: { __typename: 'Outcome'; result: string; message?: string | null }
    values: {
        __typename: 'SykmeldingFullValues'
        svangerskapsrelatert: boolean
        pasientenSkalSkjermes: boolean
        hoveddiagnose?: { __typename: 'Diagnose'; system: DiagnoseSystem; code: string; text: string } | null
        bidiagnoser?: Array<{ __typename: 'Diagnose'; system: DiagnoseSystem; code: string; text: string }> | null
        aktivitet: Array<
            | {
                  __typename: 'AktivitetIkkeMulig'
                  fom: string
                  tom: string
                  type: AktivitetType
                  arbeidsrelatertArsak?: {
                      __typename: 'ArbeidsrelatertArsak'
                      isArbeidsrelatertArsak: boolean
                      arbeidsrelaterteArsaker: Array<ArbeidsrelatertArsakType>
                      annenArbeidsrelatertArsak?: string | null
                  } | null
                  medisinskArsak?: { __typename: 'MedisinskArsak'; isMedisinskArsak: boolean } | null
              }
            | {
                  __typename: 'Avventende'
                  fom: string
                  tom: string
                  type: AktivitetType
                  innspillTilArbeidsgiver: string
              }
            | {
                  __typename: 'Behandlingsdager'
                  fom: string
                  tom: string
                  type: AktivitetType
                  antallBehandlingsdager: number
              }
            | { __typename: 'Gradert'; fom: string; tom: string; type: AktivitetType; grad: number }
            | { __typename: 'Reisetilskudd'; fom: string; tom: string; type: AktivitetType }
        >
        arbeidsgiver?: { __typename: 'Arbeidsgiver'; harFlere: boolean; arbeidsgivernavn: string } | null
        meldinger: { __typename: 'SykmeldingMelding'; tilNav?: string | null; tilArbeidsgiver?: string | null }
        yrkesskade?: { __typename: 'Yrkesskade'; yrkesskade: boolean; skadedato?: string | null } | null
        tilbakedatering?: { __typename: 'Tilbakedatering'; startdato: string; begrunnelse: string } | null
        utdypendeSporsmal?: {
            __typename: 'UtdypendeSporsmal'
            utfodringerMedArbeid?: string | null
            medisinskOppsummering?: string | null
            hensynPaArbeidsplassen?: string | null
        } | null
    }
}

type Sykmelding_SykmeldingLight_Fragment = {
    __typename: 'SykmeldingLight'
    sykmeldingId: string
    documentStatus?: DocumentStatus | null
    meta: {
        __typename: 'SykmeldingMeta'
        pasientIdent: string
        sykmelderHpr: string
        legekontorOrgnr?: string | null
        mottatt: string
    }
    utfall: { __typename: 'Outcome'; result: string; message?: string | null }
    values: {
        __typename: 'SykmeldingLightValues'
        hoveddiagnose?: { __typename: 'Diagnose'; system: DiagnoseSystem; code: string; text: string } | null
        bidiagnoser?: Array<{ __typename: 'Diagnose'; system: DiagnoseSystem; code: string; text: string }> | null
        aktivitet: Array<
            | {
                  __typename: 'AktivitetIkkeMulig'
                  fom: string
                  tom: string
                  type: AktivitetType
                  arbeidsrelatertArsak?: {
                      __typename: 'ArbeidsrelatertArsak'
                      isArbeidsrelatertArsak: boolean
                      arbeidsrelaterteArsaker: Array<ArbeidsrelatertArsakType>
                      annenArbeidsrelatertArsak?: string | null
                  } | null
                  medisinskArsak?: { __typename: 'MedisinskArsak'; isMedisinskArsak: boolean } | null
              }
            | {
                  __typename: 'Avventende'
                  fom: string
                  tom: string
                  type: AktivitetType
                  innspillTilArbeidsgiver: string
              }
            | {
                  __typename: 'Behandlingsdager'
                  fom: string
                  tom: string
                  type: AktivitetType
                  antallBehandlingsdager: number
              }
            | { __typename: 'Gradert'; fom: string; tom: string; type: AktivitetType; grad: number }
            | { __typename: 'Reisetilskudd'; fom: string; tom: string; type: AktivitetType }
        >
    }
}

type Sykmelding_SykmeldingRedacted_Fragment = {
    __typename: 'SykmeldingRedacted'
    sykmeldingId: string
    meta: {
        __typename: 'SykmeldingMeta'
        pasientIdent: string
        sykmelderHpr: string
        legekontorOrgnr?: string | null
        mottatt: string
    }
    utfall: { __typename: 'Outcome'; result: string; message?: string | null }
    values: {
        __typename: 'SykmeldingRedactedValues'
        aktivitet: Array<{ __typename: 'AktivitetRedacted'; type: AktivitetType; fom: string; tom: string }>
    }
}

export type SykmeldingFragment =
    | Sykmelding_SykmeldingFull_Fragment
    | Sykmelding_SykmeldingLight_Fragment
    | Sykmelding_SykmeldingRedacted_Fragment

type Aktivitet_AktivitetIkkeMulig_Fragment = {
    __typename: 'AktivitetIkkeMulig'
    fom: string
    tom: string
    type: AktivitetType
    arbeidsrelatertArsak?: {
        __typename: 'ArbeidsrelatertArsak'
        isArbeidsrelatertArsak: boolean
        arbeidsrelaterteArsaker: Array<ArbeidsrelatertArsakType>
        annenArbeidsrelatertArsak?: string | null
    } | null
    medisinskArsak?: { __typename: 'MedisinskArsak'; isMedisinskArsak: boolean } | null
}

type Aktivitet_Avventende_Fragment = {
    __typename: 'Avventende'
    fom: string
    tom: string
    type: AktivitetType
    innspillTilArbeidsgiver: string
}

type Aktivitet_Behandlingsdager_Fragment = {
    __typename: 'Behandlingsdager'
    fom: string
    tom: string
    type: AktivitetType
    antallBehandlingsdager: number
}

type Aktivitet_Gradert_Fragment = { __typename: 'Gradert'; fom: string; tom: string; type: AktivitetType; grad: number }

type Aktivitet_Reisetilskudd_Fragment = { __typename: 'Reisetilskudd'; fom: string; tom: string; type: AktivitetType }

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
    __typename: 'Mutation'
    synchronizeSykmelding: {
        __typename: 'SynchronizationStatus'
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
export const DraftFragmentDoc = {
    kind: 'Document',
    definitions: [
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'Draft' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'OpprettSykmeldingDraft' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'draftId' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'values' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'lastUpdated' } },
                ],
            },
        },
    ],
} as unknown as DocumentNode<DraftFragment, unknown>
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
export const KonsultasjonFragmentDoc = {
    kind: 'Document',
    definitions: [
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'Konsultasjon' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Konsultasjon' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'diagnoser' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'Diagnose' } }],
                        },
                    },
                    { kind: 'Field', name: { kind: 'Name', value: 'hasRequestedAccessToSykmeldinger' } },
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
} as unknown as DocumentNode<KonsultasjonFragment, unknown>
export const RuleOutcomeFragmentDoc = {
    kind: 'Document',
    definitions: [
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'RuleOutcome' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'RuleOutcome' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'message' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'rule' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'tree' } },
                ],
            },
        },
    ],
} as unknown as DocumentNode<RuleOutcomeFragment, unknown>
export const SykmeldingRedactedFragmentDoc = {
    kind: 'Document',
    definitions: [
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'SykmeldingRedacted' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'SykmeldingRedacted' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'sykmeldingId' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'meta' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'pasientIdent' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'sykmelderHpr' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'legekontorOrgnr' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'mottatt' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'utfall' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'result' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'values' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'aktivitet' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'fom' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'tom' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<SykmeldingRedactedFragment, unknown>
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
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'arbeidsrelatertArsak' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'isArbeidsrelatertArsak' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'arbeidsrelaterteArsaker' } },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'annenArbeidsrelatertArsak' },
                                            },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'medisinskArsak' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'isMedisinskArsak' } },
                                        ],
                                    },
                                },
                            ],
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
export const SykmeldingFullFragmentDoc = {
    kind: 'Document',
    definitions: [
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'SykmeldingFull' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'SykmeldingFull' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'sykmeldingId' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'meta' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'pasientIdent' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'sykmelderHpr' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'legekontorOrgnr' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'mottatt' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'utfall' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'result' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'values' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'hoveddiagnose' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'FragmentSpread', name: { kind: 'Name', value: 'Diagnose' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'bidiagnoser' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'FragmentSpread', name: { kind: 'Name', value: 'Diagnose' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'aktivitet' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'FragmentSpread', name: { kind: 'Name', value: 'Aktivitet' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'arbeidsgiver' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'harFlere' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'arbeidsgivernavn' } },
                                        ],
                                    },
                                },
                                { kind: 'Field', name: { kind: 'Name', value: 'svangerskapsrelatert' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'pasientenSkalSkjermes' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'meldinger' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'tilNav' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'tilArbeidsgiver' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'yrkesskade' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'yrkesskade' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'skadedato' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'tilbakedatering' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'startdato' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'begrunnelse' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'utdypendeSporsmal' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'utfodringerMedArbeid' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'medisinskOppsummering' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'hensynPaArbeidsplassen' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    { kind: 'Field', name: { kind: 'Name', value: 'documentStatus' } },
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
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'arbeidsrelatertArsak' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'isArbeidsrelatertArsak' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'arbeidsrelaterteArsaker' } },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'annenArbeidsrelatertArsak' },
                                            },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'medisinskArsak' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'isMedisinskArsak' } },
                                        ],
                                    },
                                },
                            ],
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
} as unknown as DocumentNode<SykmeldingFullFragment, unknown>
export const SykmeldingLightFragmentDoc = {
    kind: 'Document',
    definitions: [
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'SykmeldingLight' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'SykmeldingLight' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'sykmeldingId' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'meta' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'pasientIdent' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'sykmelderHpr' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'legekontorOrgnr' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'mottatt' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'utfall' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'result' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'values' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'hoveddiagnose' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'FragmentSpread', name: { kind: 'Name', value: 'Diagnose' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'bidiagnoser' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'FragmentSpread', name: { kind: 'Name', value: 'Diagnose' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'aktivitet' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'FragmentSpread', name: { kind: 'Name', value: 'Aktivitet' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    { kind: 'Field', name: { kind: 'Name', value: 'documentStatus' } },
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
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'arbeidsrelatertArsak' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'isArbeidsrelatertArsak' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'arbeidsrelaterteArsaker' } },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'annenArbeidsrelatertArsak' },
                                            },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'medisinskArsak' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'isMedisinskArsak' } },
                                        ],
                                    },
                                },
                            ],
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
} as unknown as DocumentNode<SykmeldingLightFragment, unknown>
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
                    { kind: 'FragmentSpread', name: { kind: 'Name', value: 'SykmeldingRedacted' } },
                    { kind: 'FragmentSpread', name: { kind: 'Name', value: 'SykmeldingFull' } },
                    { kind: 'FragmentSpread', name: { kind: 'Name', value: 'SykmeldingLight' } },
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
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'arbeidsrelatertArsak' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'isArbeidsrelatertArsak' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'arbeidsrelaterteArsaker' } },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'annenArbeidsrelatertArsak' },
                                            },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'medisinskArsak' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'isMedisinskArsak' } },
                                        ],
                                    },
                                },
                            ],
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
            name: { kind: 'Name', value: 'SykmeldingRedacted' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'SykmeldingRedacted' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'sykmeldingId' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'meta' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'pasientIdent' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'sykmelderHpr' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'legekontorOrgnr' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'mottatt' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'utfall' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'result' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'values' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'aktivitet' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'fom' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'tom' } },
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
            name: { kind: 'Name', value: 'SykmeldingFull' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'SykmeldingFull' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'sykmeldingId' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'meta' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'pasientIdent' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'sykmelderHpr' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'legekontorOrgnr' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'mottatt' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'utfall' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'result' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'values' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'hoveddiagnose' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'FragmentSpread', name: { kind: 'Name', value: 'Diagnose' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'bidiagnoser' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'FragmentSpread', name: { kind: 'Name', value: 'Diagnose' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'aktivitet' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'FragmentSpread', name: { kind: 'Name', value: 'Aktivitet' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'arbeidsgiver' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'harFlere' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'arbeidsgivernavn' } },
                                        ],
                                    },
                                },
                                { kind: 'Field', name: { kind: 'Name', value: 'svangerskapsrelatert' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'pasientenSkalSkjermes' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'meldinger' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'tilNav' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'tilArbeidsgiver' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'yrkesskade' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'yrkesskade' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'skadedato' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'tilbakedatering' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'startdato' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'begrunnelse' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'utdypendeSporsmal' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'utfodringerMedArbeid' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'medisinskOppsummering' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'hensynPaArbeidsplassen' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    { kind: 'Field', name: { kind: 'Name', value: 'documentStatus' } },
                ],
            },
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'SykmeldingLight' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'SykmeldingLight' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'sykmeldingId' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'meta' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'pasientIdent' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'sykmelderHpr' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'legekontorOrgnr' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'mottatt' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'utfall' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'result' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'values' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'hoveddiagnose' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'FragmentSpread', name: { kind: 'Name', value: 'Diagnose' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'bidiagnoser' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'FragmentSpread', name: { kind: 'Name', value: 'Diagnose' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'aktivitet' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'FragmentSpread', name: { kind: 'Name', value: 'Aktivitet' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    { kind: 'Field', name: { kind: 'Name', value: 'documentStatus' } },
                ],
            },
        },
    ],
} as unknown as DocumentNode<SykmeldingFragment, unknown>
export const AllDashboardDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'query',
            name: { kind: 'Name', value: 'AllDashboard' },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'drafts' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'Draft' } }],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'sykmeldinger' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'current' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'FragmentSpread', name: { kind: 'Name', value: 'Sykmelding' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'historical' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'FragmentSpread', name: { kind: 'Name', value: 'Sykmelding' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'konsultasjon' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'Konsultasjon' } }],
                        },
                    },
                ],
            },
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'SykmeldingRedacted' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'SykmeldingRedacted' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'sykmeldingId' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'meta' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'pasientIdent' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'sykmelderHpr' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'legekontorOrgnr' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'mottatt' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'utfall' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'result' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'values' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'aktivitet' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'fom' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'tom' } },
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
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'arbeidsrelatertArsak' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'isArbeidsrelatertArsak' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'arbeidsrelaterteArsaker' } },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'annenArbeidsrelatertArsak' },
                                            },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'medisinskArsak' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'isMedisinskArsak' } },
                                        ],
                                    },
                                },
                            ],
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
            name: { kind: 'Name', value: 'SykmeldingFull' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'SykmeldingFull' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'sykmeldingId' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'meta' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'pasientIdent' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'sykmelderHpr' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'legekontorOrgnr' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'mottatt' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'utfall' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'result' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'values' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'hoveddiagnose' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'FragmentSpread', name: { kind: 'Name', value: 'Diagnose' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'bidiagnoser' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'FragmentSpread', name: { kind: 'Name', value: 'Diagnose' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'aktivitet' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'FragmentSpread', name: { kind: 'Name', value: 'Aktivitet' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'arbeidsgiver' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'harFlere' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'arbeidsgivernavn' } },
                                        ],
                                    },
                                },
                                { kind: 'Field', name: { kind: 'Name', value: 'svangerskapsrelatert' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'pasientenSkalSkjermes' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'meldinger' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'tilNav' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'tilArbeidsgiver' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'yrkesskade' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'yrkesskade' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'skadedato' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'tilbakedatering' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'startdato' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'begrunnelse' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'utdypendeSporsmal' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'utfodringerMedArbeid' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'medisinskOppsummering' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'hensynPaArbeidsplassen' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    { kind: 'Field', name: { kind: 'Name', value: 'documentStatus' } },
                ],
            },
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'SykmeldingLight' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'SykmeldingLight' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'sykmeldingId' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'meta' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'pasientIdent' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'sykmelderHpr' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'legekontorOrgnr' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'mottatt' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'utfall' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'result' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'values' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'hoveddiagnose' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'FragmentSpread', name: { kind: 'Name', value: 'Diagnose' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'bidiagnoser' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'FragmentSpread', name: { kind: 'Name', value: 'Diagnose' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'aktivitet' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'FragmentSpread', name: { kind: 'Name', value: 'Aktivitet' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    { kind: 'Field', name: { kind: 'Name', value: 'documentStatus' } },
                ],
            },
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'Draft' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'OpprettSykmeldingDraft' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'draftId' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'values' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'lastUpdated' } },
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
                    { kind: 'FragmentSpread', name: { kind: 'Name', value: 'SykmeldingRedacted' } },
                    { kind: 'FragmentSpread', name: { kind: 'Name', value: 'SykmeldingFull' } },
                    { kind: 'FragmentSpread', name: { kind: 'Name', value: 'SykmeldingLight' } },
                ],
            },
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'Konsultasjon' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Konsultasjon' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'diagnoser' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'Diagnose' } }],
                        },
                    },
                    { kind: 'Field', name: { kind: 'Name', value: 'hasRequestedAccessToSykmeldinger' } },
                ],
            },
        },
    ],
} as unknown as DocumentNode<AllDashboardQuery, AllDashboardQueryVariables>
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
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'system' },
                                value: { kind: 'EnumValue', value: 'ICPC2' },
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
                            selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'Draft' } }],
                        },
                    },
                ],
            },
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'Draft' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'OpprettSykmeldingDraft' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'draftId' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'values' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'lastUpdated' } },
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
                            selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'Draft' } }],
                        },
                    },
                ],
            },
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'Draft' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'OpprettSykmeldingDraft' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'draftId' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'values' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'lastUpdated' } },
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
                            selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'Draft' } }],
                        },
                    },
                ],
            },
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'Draft' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'OpprettSykmeldingDraft' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'draftId' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'values' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'lastUpdated' } },
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
                            selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'Konsultasjon' } }],
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
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'Konsultasjon' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Konsultasjon' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'diagnoser' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'Diagnose' } }],
                        },
                    },
                    { kind: 'Field', name: { kind: 'Name', value: 'hasRequestedAccessToSykmeldinger' } },
                ],
            },
        },
    ],
} as unknown as DocumentNode<KonsultasjonQuery, KonsultasjonQueryVariables>
export const BehandlerDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'query',
            name: { kind: 'Name', value: 'Behandler' },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'behandler' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'navn' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'hpr' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'orgnummer' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'legekontorTlf' } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<BehandlerQuery, BehandlerQueryVariables>
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
                            selections: [
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'utdypendeSporsmal' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'days' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'latestTom' } },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'previouslyAnsweredSporsmal' },
                                            },
                                        ],
                                    },
                                },
                                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'Person' } },
                            ],
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
export const PasientWithExistsDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'query',
            name: { kind: 'Name', value: 'PasientWithExists' },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'pasient' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'Person' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'userExists' } },
                            ],
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
} as unknown as DocumentNode<PasientWithExistsQuery, PasientWithExistsQueryVariables>
export const ArbeidsforholdDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'query',
            name: { kind: 'Name', value: 'Arbeidsforhold' },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'pasient' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'ident' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'arbeidsforhold' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'navn' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'orgnummer' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<ArbeidsforholdQuery, ArbeidsforholdQueryVariables>
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
            name: { kind: 'Name', value: 'SykmeldingRedacted' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'SykmeldingRedacted' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'sykmeldingId' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'meta' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'pasientIdent' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'sykmelderHpr' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'legekontorOrgnr' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'mottatt' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'utfall' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'result' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'values' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'aktivitet' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'fom' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'tom' } },
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
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'arbeidsrelatertArsak' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'isArbeidsrelatertArsak' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'arbeidsrelaterteArsaker' } },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'annenArbeidsrelatertArsak' },
                                            },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'medisinskArsak' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'isMedisinskArsak' } },
                                        ],
                                    },
                                },
                            ],
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
            name: { kind: 'Name', value: 'SykmeldingFull' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'SykmeldingFull' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'sykmeldingId' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'meta' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'pasientIdent' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'sykmelderHpr' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'legekontorOrgnr' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'mottatt' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'utfall' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'result' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'values' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'hoveddiagnose' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'FragmentSpread', name: { kind: 'Name', value: 'Diagnose' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'bidiagnoser' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'FragmentSpread', name: { kind: 'Name', value: 'Diagnose' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'aktivitet' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'FragmentSpread', name: { kind: 'Name', value: 'Aktivitet' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'arbeidsgiver' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'harFlere' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'arbeidsgivernavn' } },
                                        ],
                                    },
                                },
                                { kind: 'Field', name: { kind: 'Name', value: 'svangerskapsrelatert' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'pasientenSkalSkjermes' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'meldinger' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'tilNav' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'tilArbeidsgiver' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'yrkesskade' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'yrkesskade' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'skadedato' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'tilbakedatering' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'startdato' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'begrunnelse' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'utdypendeSporsmal' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'utfodringerMedArbeid' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'medisinskOppsummering' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'hensynPaArbeidsplassen' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    { kind: 'Field', name: { kind: 'Name', value: 'documentStatus' } },
                ],
            },
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'SykmeldingLight' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'SykmeldingLight' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'sykmeldingId' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'meta' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'pasientIdent' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'sykmelderHpr' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'legekontorOrgnr' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'mottatt' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'utfall' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'result' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'values' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'hoveddiagnose' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'FragmentSpread', name: { kind: 'Name', value: 'Diagnose' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'bidiagnoser' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'FragmentSpread', name: { kind: 'Name', value: 'Diagnose' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'aktivitet' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'FragmentSpread', name: { kind: 'Name', value: 'Aktivitet' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    { kind: 'Field', name: { kind: 'Name', value: 'documentStatus' } },
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
                    { kind: 'FragmentSpread', name: { kind: 'Name', value: 'SykmeldingRedacted' } },
                    { kind: 'FragmentSpread', name: { kind: 'Name', value: 'SykmeldingFull' } },
                    { kind: 'FragmentSpread', name: { kind: 'Name', value: 'SykmeldingLight' } },
                ],
            },
        },
    ],
} as unknown as DocumentNode<SykmeldingByIdQuery, SykmeldingByIdQueryVariables>
export const AllSykmeldingerDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'query',
            name: { kind: 'Name', value: 'AllSykmeldinger' },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'sykmeldinger' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'current' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'FragmentSpread', name: { kind: 'Name', value: 'Sykmelding' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'historical' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'FragmentSpread', name: { kind: 'Name', value: 'Sykmelding' } },
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
            name: { kind: 'Name', value: 'SykmeldingRedacted' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'SykmeldingRedacted' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'sykmeldingId' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'meta' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'pasientIdent' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'sykmelderHpr' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'legekontorOrgnr' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'mottatt' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'utfall' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'result' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'values' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'aktivitet' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'fom' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'tom' } },
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
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'arbeidsrelatertArsak' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'isArbeidsrelatertArsak' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'arbeidsrelaterteArsaker' } },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'annenArbeidsrelatertArsak' },
                                            },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'medisinskArsak' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'isMedisinskArsak' } },
                                        ],
                                    },
                                },
                            ],
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
            name: { kind: 'Name', value: 'SykmeldingFull' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'SykmeldingFull' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'sykmeldingId' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'meta' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'pasientIdent' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'sykmelderHpr' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'legekontorOrgnr' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'mottatt' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'utfall' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'result' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'values' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'hoveddiagnose' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'FragmentSpread', name: { kind: 'Name', value: 'Diagnose' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'bidiagnoser' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'FragmentSpread', name: { kind: 'Name', value: 'Diagnose' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'aktivitet' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'FragmentSpread', name: { kind: 'Name', value: 'Aktivitet' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'arbeidsgiver' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'harFlere' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'arbeidsgivernavn' } },
                                        ],
                                    },
                                },
                                { kind: 'Field', name: { kind: 'Name', value: 'svangerskapsrelatert' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'pasientenSkalSkjermes' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'meldinger' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'tilNav' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'tilArbeidsgiver' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'yrkesskade' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'yrkesskade' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'skadedato' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'tilbakedatering' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'startdato' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'begrunnelse' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'utdypendeSporsmal' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'utfodringerMedArbeid' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'medisinskOppsummering' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'hensynPaArbeidsplassen' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    { kind: 'Field', name: { kind: 'Name', value: 'documentStatus' } },
                ],
            },
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'SykmeldingLight' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'SykmeldingLight' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'sykmeldingId' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'meta' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'pasientIdent' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'sykmelderHpr' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'legekontorOrgnr' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'mottatt' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'utfall' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'result' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'values' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'hoveddiagnose' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'FragmentSpread', name: { kind: 'Name', value: 'Diagnose' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'bidiagnoser' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'FragmentSpread', name: { kind: 'Name', value: 'Diagnose' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'aktivitet' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'FragmentSpread', name: { kind: 'Name', value: 'Aktivitet' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    { kind: 'Field', name: { kind: 'Name', value: 'documentStatus' } },
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
                    { kind: 'FragmentSpread', name: { kind: 'Name', value: 'SykmeldingRedacted' } },
                    { kind: 'FragmentSpread', name: { kind: 'Name', value: 'SykmeldingFull' } },
                    { kind: 'FragmentSpread', name: { kind: 'Name', value: 'SykmeldingLight' } },
                ],
            },
        },
    ],
} as unknown as DocumentNode<AllSykmeldingerQuery, AllSykmeldingerQueryVariables>
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
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'draftId' } },
                    type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
                },
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'meta' } },
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'OpprettSykmeldingMetaInput' } },
                    },
                },
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'values' } },
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'OpprettSykmeldingInput' } },
                    },
                },
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'force' } },
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'Boolean' } },
                    },
                    defaultValue: { kind: 'BooleanValue', value: false },
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
                                name: { kind: 'Name', value: 'draftId' },
                                value: { kind: 'Variable', name: { kind: 'Name', value: 'draftId' } },
                            },
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'meta' },
                                value: { kind: 'Variable', name: { kind: 'Name', value: 'meta' } },
                            },
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'values' },
                                value: { kind: 'Variable', name: { kind: 'Name', value: 'values' } },
                            },
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'force' },
                                value: { kind: 'Variable', name: { kind: 'Name', value: 'force' } },
                            },
                        ],
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'InlineFragment',
                                    typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Sykmelding' } },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'FragmentSpread', name: { kind: 'Name', value: 'Sykmelding' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'InlineFragment',
                                    typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'RuleOutcome' } },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'FragmentSpread', name: { kind: 'Name', value: 'RuleOutcome' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                        kind: 'NamedType',
                                        name: { kind: 'Name', value: 'OtherSubmitOutcomes' },
                                    },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [{ kind: 'Field', name: { kind: 'Name', value: 'cause' } }],
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
            name: { kind: 'Name', value: 'SykmeldingRedacted' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'SykmeldingRedacted' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'sykmeldingId' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'meta' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'pasientIdent' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'sykmelderHpr' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'legekontorOrgnr' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'mottatt' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'utfall' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'result' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'values' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'aktivitet' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'fom' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'tom' } },
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
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'arbeidsrelatertArsak' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'isArbeidsrelatertArsak' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'arbeidsrelaterteArsaker' } },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'annenArbeidsrelatertArsak' },
                                            },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'medisinskArsak' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'isMedisinskArsak' } },
                                        ],
                                    },
                                },
                            ],
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
            name: { kind: 'Name', value: 'SykmeldingFull' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'SykmeldingFull' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'sykmeldingId' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'meta' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'pasientIdent' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'sykmelderHpr' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'legekontorOrgnr' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'mottatt' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'utfall' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'result' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'values' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'hoveddiagnose' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'FragmentSpread', name: { kind: 'Name', value: 'Diagnose' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'bidiagnoser' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'FragmentSpread', name: { kind: 'Name', value: 'Diagnose' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'aktivitet' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'FragmentSpread', name: { kind: 'Name', value: 'Aktivitet' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'arbeidsgiver' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'harFlere' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'arbeidsgivernavn' } },
                                        ],
                                    },
                                },
                                { kind: 'Field', name: { kind: 'Name', value: 'svangerskapsrelatert' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'pasientenSkalSkjermes' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'meldinger' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'tilNav' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'tilArbeidsgiver' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'yrkesskade' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'yrkesskade' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'skadedato' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'tilbakedatering' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'startdato' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'begrunnelse' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'utdypendeSporsmal' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'utfodringerMedArbeid' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'medisinskOppsummering' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'hensynPaArbeidsplassen' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    { kind: 'Field', name: { kind: 'Name', value: 'documentStatus' } },
                ],
            },
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'SykmeldingLight' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'SykmeldingLight' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'sykmeldingId' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'meta' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'pasientIdent' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'sykmelderHpr' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'legekontorOrgnr' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'mottatt' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'utfall' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'result' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'values' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'hoveddiagnose' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'FragmentSpread', name: { kind: 'Name', value: 'Diagnose' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'bidiagnoser' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'FragmentSpread', name: { kind: 'Name', value: 'Diagnose' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'aktivitet' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'FragmentSpread', name: { kind: 'Name', value: 'Aktivitet' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    { kind: 'Field', name: { kind: 'Name', value: 'documentStatus' } },
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
                    { kind: 'FragmentSpread', name: { kind: 'Name', value: 'SykmeldingRedacted' } },
                    { kind: 'FragmentSpread', name: { kind: 'Name', value: 'SykmeldingFull' } },
                    { kind: 'FragmentSpread', name: { kind: 'Name', value: 'SykmeldingLight' } },
                ],
            },
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'RuleOutcome' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'RuleOutcome' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'message' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'rule' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'tree' } },
                ],
            },
        },
    ],
} as unknown as DocumentNode<OpprettSykmeldingMutation, OpprettSykmeldingMutationVariables>
export const RequestAccessToSykmeldingerDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'RequestAccessToSykmeldinger' },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [{ kind: 'Field', name: { kind: 'Name', value: 'requestAccessToSykmeldinger' } }],
            },
        },
    ],
} as unknown as DocumentNode<RequestAccessToSykmeldingerMutation, RequestAccessToSykmeldingerMutationVariables>
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
