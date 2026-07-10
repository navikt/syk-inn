/* oxlint-disable */
export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
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
    arbeidsrelatertArsak: ArbeidsrelatertArsak
    fom: Scalars['DateOnly']['output']
    tom: Scalars['DateOnly']['output']
    type: AktivitetType
}

export type AktivitetIkkeMuligInput = {
    arbeidsrelatertArsak: ArbeidsrelatertArsakInput
    fom: Scalars['String']['input']
    tom: Scalars['String']['input']
}

export type AktivitetRedacted = FomTom & {
    __typename: 'AktivitetRedacted'
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
    /**
     * B: Når pasienten er under behandling som gjør det nødvendig med fravær fra arbeid (ikke enkeltstående behandlingsdager)
     *    Dette er spesifikt IKKE!!!! enkeltstående behandlingsdager, og faller under den forenklede annen fraværsgrunnene
     *    vi støtter i denne spesifikke flyten.
     */
    | 'BEHANDLING_FORHINDRER_ARBEID'
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
    annenArbeidsrelatertArsak: Maybe<Scalars['String']['output']>
    arbeidsrelaterteArsaker: Array<ArbeidsrelatertArsakType>
    isArbeidsrelatertArsak: Scalars['Boolean']['output']
}

export type ArbeidsrelatertArsakInput = {
    annenArbeidsrelatertArsak: InputMaybe<Scalars['String']['input']>
    arbeidsrelaterteArsaker: Array<Scalars['String']['input']>
    isArbeidsrelatertArsak: Scalars['Boolean']['input']
}

export type ArbeidsrelatertArsakType = 'ANNET' | 'MANGLENDE_TILRETTELEGGING'

export type Avventende = FomTom & {
    __typename: 'Avventende'
    fom: Scalars['DateOnly']['output']
    innspillTilArbeidsgiver: Scalars['String']['output']
    tom: Scalars['DateOnly']['output']
    type: AktivitetType
}

export type AvventendeInput = {
    fom: Scalars['String']['input']
    innspillTilArbeidsgiver: Scalars['String']['input']
    tom: Scalars['String']['input']
}

export type Behandler = {
    __typename: 'Behandler'
    epost: Maybe<Scalars['String']['output']>
    hpr: Scalars['String']['output']
    legekontorTlf: Maybe<Scalars['String']['output']>
    navn: Scalars['String']['output']
    orgnummer: Maybe<Scalars['String']['output']>
}

export type Behandlingsdager = FomTom & {
    __typename: 'Behandlingsdager'
    antallBehandlingsdager: Scalars['Int']['output']
    fom: Scalars['DateOnly']['output']
    tom: Scalars['DateOnly']['output']
    type: AktivitetType
}

export type BehandlingsdagerInput = {
    fom: Scalars['String']['input']
    tom: Scalars['String']['input']
}

export type Diagnose = {
    __typename: 'Diagnose'
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
    __typename: 'Gradert'
    fom: Scalars['DateOnly']['output']
    grad: Scalars['Int']['output']
    reisetilskudd: Scalars['Boolean']['output']
    tom: Scalars['DateOnly']['output']
    type: AktivitetType
}

export type GradertInput = {
    fom: Scalars['String']['input']
    grad: Scalars['Int']['input']
    reisetilskudd: Scalars['Boolean']['input']
    tom: Scalars['String']['input']
}

export type InputAktivitet =
    | {
          aktivitetIkkeMulig: AktivitetIkkeMuligInput
          avventende?: never
          behandlingsdager?: never
          gradert?: never
          reisetilskudd?: never
      }
    | {
          aktivitetIkkeMulig?: never
          avventende: AvventendeInput
          behandlingsdager?: never
          gradert?: never
          reisetilskudd?: never
      }
    | {
          aktivitetIkkeMulig?: never
          avventende?: never
          behandlingsdager: BehandlingsdagerInput
          gradert?: never
          reisetilskudd?: never
      }
    | {
          aktivitetIkkeMulig?: never
          avventende?: never
          behandlingsdager?: never
          gradert: GradertInput
          reisetilskudd?: never
      }
    | {
          aktivitetIkkeMulig?: never
          avventende?: never
          behandlingsdager?: never
          gradert?: never
          reisetilskudd: ReisetilskuddInput
      }

export type InputArbeidsforhold = {
    arbeidsgivernavn: Scalars['String']['input']
}

export type InputDiagnose = {
    code: Scalars['String']['input']
    system: DiagnoseSystem
}

export type InputMeldinger = {
    tilArbeidsgiver: InputMaybe<Scalars['String']['input']>
    tilNav: InputMaybe<Scalars['String']['input']>
}

export type InputTilbakedatering = {
    begrunnelse: Scalars['String']['input']
    startdato: Scalars['String']['input']
}

export type InputUtdypendeSporsmal = {
    arbeidsrelaterteUtfordringer: InputMaybe<Scalars['String']['input']>
    behandlingOgFremtidigArbeid: InputMaybe<Scalars['String']['input']>
    forventetHelsetilstandUtvikling: InputMaybe<Scalars['String']['input']>
    hensynPaArbeidsplassen: InputMaybe<Scalars['String']['input']>
    medisinskOppsummering: InputMaybe<Scalars['String']['input']>
    medisinskeHensyn: InputMaybe<Scalars['String']['input']>
    oppdatertMedisinskStatus: InputMaybe<Scalars['String']['input']>
    realistiskMestringArbeid: InputMaybe<Scalars['String']['input']>
    sykdomsutvikling: InputMaybe<Scalars['String']['input']>
    uavklarteForhold: InputMaybe<Scalars['String']['input']>
    utfordringerMedArbeid: InputMaybe<Scalars['String']['input']>
}

export type InputYrkesskade = {
    skadedato: InputMaybe<Scalars['DateOnly']['input']>
    yrkesskade: Scalars['Boolean']['input']
}

export type Konsultasjon = {
    __typename: 'Konsultasjon'
    diagnoser: Maybe<Array<Diagnose>>
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
    annenFravarsgrunn: InputMaybe<AnnenFravarsgrunnArsak>
    arbeidsforhold: InputMaybe<InputArbeidsforhold>
    bidiagnoser: Array<InputDiagnose>
    hoveddiagnose: InputDiagnose
    meldinger: InputMeldinger
    pasientenSkalSkjermes: Scalars['Boolean']['input']
    svangerskapsrelatert: Scalars['Boolean']['input']
    tilbakedatering: InputMaybe<InputTilbakedatering>
    utdypendeSporsmal: InputMaybe<InputUtdypendeSporsmal>
    yrkesskade: InputMaybe<InputYrkesskade>
}

export type OpprettSykmeldingMetaInput = {
    legekontorTlf: InputMaybe<Scalars['String']['input']>
    orgnummer: InputMaybe<Scalars['String']['input']>
}

export type OpprettetSykmelding = OtherSubmitOutcomes | RuleOutcome | SykmeldingFull

export type OtherSubmitOutcomes = {
    __typename: 'OtherSubmitOutcomes'
    cause: OtherSubmitOutcomesEnum
}

export type OtherSubmitOutcomesEnum = 'MISSING_PRACTITIONER_INFO' | 'PATIENT_NOT_FOUND_IN_PDL'

export type Outcome = {
    __typename: 'Outcome'
    melding: Maybe<Scalars['String']['output']>
    result: Scalars['String']['output']
}

export type Pasient = Person & {
    __typename: 'Pasient'
    arbeidsforhold: Maybe<Array<Arbeidsforhold>>
    ident: Scalars['String']['output']
    navn: Scalars['String']['output']
    /** Does the user exist outside of FHIR? In other words, is this a real person? */
    userExists: Maybe<Scalars['Boolean']['output']>
    utdypendeSporsmal: Maybe<UtdypendeOpplysningerHint>
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
    behandler: Maybe<Behandler>
    diagnose: Maybe<Array<Diagnose>>
    draft: Maybe<OpprettSykmeldingDraft>
    drafts: Maybe<Array<OpprettSykmeldingDraft>>
    konsultasjon: Maybe<Konsultasjon>
    pasient: Maybe<Pasient>
    person: Maybe<QueriedPerson>
    sykmelding: Maybe<Sykmelding>
    sykmeldinger: Maybe<Sykmeldinger>
}

export type QueryDiagnoseArgs = {
    query: Scalars['String']['input']
    systems: Array<DiagnoseSystem>
}

export type QueryDraftArgs = {
    draftId: Scalars['String']['input']
}

export type QueryPersonArgs = {
    ident: InputMaybe<Scalars['String']['input']>
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
    fom: Scalars['String']['input']
    tom: Scalars['String']['input']
}

export type Requested = {
    __typename: 'Requested'
    aktuelle: Array<Sykmelding>
    historiske: Array<Sykmelding>
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
}

export type RuleOutcomeStatus = 'INVALID' | 'PENDING'

export type SporsmalSvar = {
    __typename: 'SporsmalSvar'
    sporsmalstekst: Maybe<Scalars['String']['output']>
    svar: Scalars['String']['output']
}

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
    documentStatus: Maybe<DocumentStatus>
    kind: Scalars['String']['output']
    meta: SykmeldingMeta
    sykmeldingId: Scalars['String']['output']
    utfall: Outcome
    values: SykmeldingFullValues
}

export type SykmeldingFullValues = {
    __typename: 'SykmeldingFullValues'
    aktivitet: Array<Aktivitet>
    annenFravarsgrunn: Maybe<AnnenFravarsgrunnArsak>
    arbeidsgiver: Maybe<Arbeidsgiver>
    bidiagnoser: Maybe<Array<Diagnose>>
    hoveddiagnose: Maybe<Diagnose>
    meldinger: Maybe<SykmeldingMelding>
    pasientenSkalSkjermes: Scalars['Boolean']['output']
    svangerskapsrelatert: Scalars['Boolean']['output']
    tilbakedatering: Maybe<Tilbakedatering>
    utdypendeSporsmal: Maybe<UtdypendeSporsmal>
    utdypendeSporsmalSvar: Maybe<UtdypendeSporsmalSvar>
    yrkesskade: Maybe<Yrkesskade>
}

export type SykmeldingLight = SykmeldingBase & {
    __typename: 'SykmeldingLight'
    /** Status on the document in the EHR system. */
    documentStatus: Maybe<DocumentStatus>
    kind: Scalars['String']['output']
    meta: SykmeldingMeta
    sykmeldingId: Scalars['String']['output']
    utfall: Outcome
    values: SykmeldingLightValues
}

export type SykmeldingLightValues = {
    __typename: 'SykmeldingLightValues'
    aktivitet: Array<Aktivitet>
    bidiagnoser: Maybe<Array<Diagnose>>
    hoveddiagnose: Maybe<Diagnose>
}

export type SykmeldingMelding = {
    __typename: 'SykmeldingMelding'
    tilArbeidsgiver: Maybe<Scalars['String']['output']>
    tilNav: Maybe<Scalars['String']['output']>
}

export type SykmeldingMeta = {
    __typename: 'SykmeldingMeta'
    legekontorOrgnr: Maybe<Scalars['String']['output']>
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

export type Sykmeldinger = Requested | Unrequested

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

export type Unrequested = {
    __typename: 'Unrequested'
    aktuelle: Array<Sykmelding>
}

export type UtdypendeOpplysningerHint = {
    __typename: 'UtdypendeOpplysningerHint'
    days: Scalars['Int']['output']
    latestTom: Maybe<Scalars['String']['output']>
    previouslyAnsweredSporsmal: Array<UtdypendeSporsmalOptions>
}

export type UtdypendeSporsmal = {
    __typename: 'UtdypendeSporsmal'
    hensynPaArbeidsplassen: Maybe<Scalars['String']['output']>
    medisinskOppsummering: Maybe<Scalars['String']['output']>
    utfordringerMedArbeid: Maybe<Scalars['String']['output']>
}

export type UtdypendeSporsmalOptions =
    | 'BEHANDLING_OG_FREMTIDIG_ARBEID'
    | 'FORVENTET_HELSETILSTAND_UTVIKLING'
    | 'HENSYN_PA_ARBEIDSPLASSEN'
    | 'MEDISINSKE_HENSYN'
    | 'MEDISINSK_OPPSUMMERING'
    | 'UAVKLARTE_FORHOLD'
    | 'UTFORDRINGER_MED_ARBEID'

export type UtdypendeSporsmalSvar = {
    __typename: 'UtdypendeSporsmalSvar'
    arbeidsrelaterteUtfordringer: Maybe<SporsmalSvar>
    behandlingOgFremtidigArbeid: Maybe<SporsmalSvar>
    forventetHelsetilstandUtvikling: Maybe<SporsmalSvar>
    hensynPaArbeidsplassen: Maybe<SporsmalSvar>
    medisinskOppsummering: Maybe<SporsmalSvar>
    medisinskeHensyn: Maybe<SporsmalSvar>
    oppdatertMedisinskStatus: Maybe<SporsmalSvar>
    realistiskMestringArbeid: Maybe<SporsmalSvar>
    sykdomsutvikling: Maybe<SporsmalSvar>
    uavklarteForhold: Maybe<SporsmalSvar>
    utfordringerMedArbeid: Maybe<SporsmalSvar>
}

export type Yrkesskade = {
    __typename: 'Yrkesskade'
    skadedato: Maybe<Scalars['DateOnly']['output']>
    yrkesskade: Scalars['Boolean']['output']
}
