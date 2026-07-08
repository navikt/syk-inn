/* oxlint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never }
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core'

import type * as Types from './types.generated'
export * from './types.generated'
type Person_Pasient_Fragment = { __typename: 'Pasient'; ident: string; navn: string }

type Person_QueriedPerson_Fragment = { __typename: 'QueriedPerson'; ident: string; navn: string }

export type PersonFragment = Person_Pasient_Fragment | Person_QueriedPerson_Fragment

export type AllDashboardQueryVariables = Exact<{ [key: string]: never }>

export type AllDashboardQuery = {
    __typename: 'Query'
    drafts: Array<{
        __typename: 'OpprettSykmeldingDraft'
        draftId: string
        values: unknown
        lastUpdated: string
    }> | null
    sykmeldinger: {
        __typename: 'Sykmeldinger'
        current: Array<
            | {
                  __typename: 'SykmeldingFull'
                  sykmeldingId: string
                  documentStatus: Types.DocumentStatus | null
                  meta: {
                      __typename: 'SykmeldingMeta'
                      pasientIdent: string
                      sykmelderHpr: string
                      legekontorOrgnr: string | null
                      mottatt: string
                  }
                  utfall: { __typename: 'Outcome'; result: string; melding: string | null }
                  values: {
                      __typename: 'SykmeldingFullValues'
                      svangerskapsrelatert: boolean
                      pasientenSkalSkjermes: boolean
                      annenFravarsgrunn: Types.AnnenFravarsgrunnArsak | null
                      hoveddiagnose: {
                          __typename: 'Diagnose'
                          system: Types.DiagnoseSystem
                          code: string
                          text: string
                      } | null
                      bidiagnoser: Array<{
                          __typename: 'Diagnose'
                          system: Types.DiagnoseSystem
                          code: string
                          text: string
                      }> | null
                      aktivitet: Array<
                          | {
                                __typename: 'AktivitetIkkeMulig'
                                fom: string
                                tom: string
                                type: Types.AktivitetType
                                arbeidsrelatertArsak: {
                                    __typename: 'ArbeidsrelatertArsak'
                                    isArbeidsrelatertArsak: boolean
                                    arbeidsrelaterteArsaker: Array<Types.ArbeidsrelatertArsakType>
                                    annenArbeidsrelatertArsak: string | null
                                }
                            }
                          | {
                                __typename: 'Avventende'
                                fom: string
                                tom: string
                                type: Types.AktivitetType
                                innspillTilArbeidsgiver: string
                            }
                          | {
                                __typename: 'Behandlingsdager'
                                fom: string
                                tom: string
                                type: Types.AktivitetType
                                antallBehandlingsdager: number
                            }
                          | {
                                __typename: 'Gradert'
                                fom: string
                                tom: string
                                type: Types.AktivitetType
                                grad: number
                                reisetilskudd: boolean
                            }
                          | { __typename: 'Reisetilskudd'; fom: string; tom: string; type: Types.AktivitetType }
                      >
                      arbeidsgiver: { __typename: 'Arbeidsgiver'; harFlere: boolean; arbeidsgivernavn: string } | null
                      meldinger: {
                          __typename: 'SykmeldingMelding'
                          tilNav: string | null
                          tilArbeidsgiver: string | null
                      } | null
                      yrkesskade: { __typename: 'Yrkesskade'; yrkesskade: boolean; skadedato: string | null } | null
                      tilbakedatering: { __typename: 'Tilbakedatering'; startdato: string; begrunnelse: string } | null
                      utdypendeSporsmal: {
                          __typename: 'UtdypendeSporsmal'
                          utfordringerMedArbeid: string | null
                          medisinskOppsummering: string | null
                          hensynPaArbeidsplassen: string | null
                      } | null
                      utdypendeSporsmalSvar: {
                          __typename: 'UtdypendeSporsmalSvar'
                          utfordringerMedArbeid: {
                              __typename: 'SporsmalSvar'
                              sporsmalstekst: string | null
                              svar: string
                          } | null
                          medisinskOppsummering: {
                              __typename: 'SporsmalSvar'
                              sporsmalstekst: string | null
                              svar: string
                          } | null
                          hensynPaArbeidsplassen: {
                              __typename: 'SporsmalSvar'
                              sporsmalstekst: string | null
                              svar: string
                          } | null
                          sykdomsutvikling: {
                              __typename: 'SporsmalSvar'
                              sporsmalstekst: string | null
                              svar: string
                          } | null
                          arbeidsrelaterteUtfordringer: {
                              __typename: 'SporsmalSvar'
                              sporsmalstekst: string | null
                              svar: string
                          } | null
                          behandlingOgFremtidigArbeid: {
                              __typename: 'SporsmalSvar'
                              sporsmalstekst: string | null
                              svar: string
                          } | null
                          uavklarteForhold: {
                              __typename: 'SporsmalSvar'
                              sporsmalstekst: string | null
                              svar: string
                          } | null
                          oppdatertMedisinskStatus: {
                              __typename: 'SporsmalSvar'
                              sporsmalstekst: string | null
                              svar: string
                          } | null
                          realistiskMestringArbeid: {
                              __typename: 'SporsmalSvar'
                              sporsmalstekst: string | null
                              svar: string
                          } | null
                          forventetHelsetilstandUtvikling: {
                              __typename: 'SporsmalSvar'
                              sporsmalstekst: string | null
                              svar: string
                          } | null
                          medisinskeHensyn: {
                              __typename: 'SporsmalSvar'
                              sporsmalstekst: string | null
                              svar: string
                          } | null
                      } | null
                  }
              }
            | {
                  __typename: 'SykmeldingLight'
                  sykmeldingId: string
                  documentStatus: Types.DocumentStatus | null
                  meta: {
                      __typename: 'SykmeldingMeta'
                      pasientIdent: string
                      sykmelderHpr: string
                      legekontorOrgnr: string | null
                      mottatt: string
                  }
                  utfall: { __typename: 'Outcome'; result: string; melding: string | null }
                  values: {
                      __typename: 'SykmeldingLightValues'
                      hoveddiagnose: {
                          __typename: 'Diagnose'
                          system: Types.DiagnoseSystem
                          code: string
                          text: string
                      } | null
                      bidiagnoser: Array<{
                          __typename: 'Diagnose'
                          system: Types.DiagnoseSystem
                          code: string
                          text: string
                      }> | null
                      aktivitet: Array<
                          | {
                                __typename: 'AktivitetIkkeMulig'
                                fom: string
                                tom: string
                                type: Types.AktivitetType
                                arbeidsrelatertArsak: {
                                    __typename: 'ArbeidsrelatertArsak'
                                    isArbeidsrelatertArsak: boolean
                                    arbeidsrelaterteArsaker: Array<Types.ArbeidsrelatertArsakType>
                                    annenArbeidsrelatertArsak: string | null
                                }
                            }
                          | {
                                __typename: 'Avventende'
                                fom: string
                                tom: string
                                type: Types.AktivitetType
                                innspillTilArbeidsgiver: string
                            }
                          | {
                                __typename: 'Behandlingsdager'
                                fom: string
                                tom: string
                                type: Types.AktivitetType
                                antallBehandlingsdager: number
                            }
                          | {
                                __typename: 'Gradert'
                                fom: string
                                tom: string
                                type: Types.AktivitetType
                                grad: number
                                reisetilskudd: boolean
                            }
                          | { __typename: 'Reisetilskudd'; fom: string; tom: string; type: Types.AktivitetType }
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
                      legekontorOrgnr: string | null
                      mottatt: string
                  }
                  utfall: { __typename: 'Outcome'; result: string; melding: string | null }
                  values: {
                      __typename: 'SykmeldingRedactedValues'
                      aktivitet: Array<{
                          __typename: 'AktivitetRedacted'
                          type: Types.AktivitetType
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
                  documentStatus: Types.DocumentStatus | null
                  meta: {
                      __typename: 'SykmeldingMeta'
                      pasientIdent: string
                      sykmelderHpr: string
                      legekontorOrgnr: string | null
                      mottatt: string
                  }
                  utfall: { __typename: 'Outcome'; result: string; melding: string | null }
                  values: {
                      __typename: 'SykmeldingFullValues'
                      svangerskapsrelatert: boolean
                      pasientenSkalSkjermes: boolean
                      annenFravarsgrunn: Types.AnnenFravarsgrunnArsak | null
                      hoveddiagnose: {
                          __typename: 'Diagnose'
                          system: Types.DiagnoseSystem
                          code: string
                          text: string
                      } | null
                      bidiagnoser: Array<{
                          __typename: 'Diagnose'
                          system: Types.DiagnoseSystem
                          code: string
                          text: string
                      }> | null
                      aktivitet: Array<
                          | {
                                __typename: 'AktivitetIkkeMulig'
                                fom: string
                                tom: string
                                type: Types.AktivitetType
                                arbeidsrelatertArsak: {
                                    __typename: 'ArbeidsrelatertArsak'
                                    isArbeidsrelatertArsak: boolean
                                    arbeidsrelaterteArsaker: Array<Types.ArbeidsrelatertArsakType>
                                    annenArbeidsrelatertArsak: string | null
                                }
                            }
                          | {
                                __typename: 'Avventende'
                                fom: string
                                tom: string
                                type: Types.AktivitetType
                                innspillTilArbeidsgiver: string
                            }
                          | {
                                __typename: 'Behandlingsdager'
                                fom: string
                                tom: string
                                type: Types.AktivitetType
                                antallBehandlingsdager: number
                            }
                          | {
                                __typename: 'Gradert'
                                fom: string
                                tom: string
                                type: Types.AktivitetType
                                grad: number
                                reisetilskudd: boolean
                            }
                          | { __typename: 'Reisetilskudd'; fom: string; tom: string; type: Types.AktivitetType }
                      >
                      arbeidsgiver: { __typename: 'Arbeidsgiver'; harFlere: boolean; arbeidsgivernavn: string } | null
                      meldinger: {
                          __typename: 'SykmeldingMelding'
                          tilNav: string | null
                          tilArbeidsgiver: string | null
                      } | null
                      yrkesskade: { __typename: 'Yrkesskade'; yrkesskade: boolean; skadedato: string | null } | null
                      tilbakedatering: { __typename: 'Tilbakedatering'; startdato: string; begrunnelse: string } | null
                      utdypendeSporsmal: {
                          __typename: 'UtdypendeSporsmal'
                          utfordringerMedArbeid: string | null
                          medisinskOppsummering: string | null
                          hensynPaArbeidsplassen: string | null
                      } | null
                      utdypendeSporsmalSvar: {
                          __typename: 'UtdypendeSporsmalSvar'
                          utfordringerMedArbeid: {
                              __typename: 'SporsmalSvar'
                              sporsmalstekst: string | null
                              svar: string
                          } | null
                          medisinskOppsummering: {
                              __typename: 'SporsmalSvar'
                              sporsmalstekst: string | null
                              svar: string
                          } | null
                          hensynPaArbeidsplassen: {
                              __typename: 'SporsmalSvar'
                              sporsmalstekst: string | null
                              svar: string
                          } | null
                          sykdomsutvikling: {
                              __typename: 'SporsmalSvar'
                              sporsmalstekst: string | null
                              svar: string
                          } | null
                          arbeidsrelaterteUtfordringer: {
                              __typename: 'SporsmalSvar'
                              sporsmalstekst: string | null
                              svar: string
                          } | null
                          behandlingOgFremtidigArbeid: {
                              __typename: 'SporsmalSvar'
                              sporsmalstekst: string | null
                              svar: string
                          } | null
                          uavklarteForhold: {
                              __typename: 'SporsmalSvar'
                              sporsmalstekst: string | null
                              svar: string
                          } | null
                          oppdatertMedisinskStatus: {
                              __typename: 'SporsmalSvar'
                              sporsmalstekst: string | null
                              svar: string
                          } | null
                          realistiskMestringArbeid: {
                              __typename: 'SporsmalSvar'
                              sporsmalstekst: string | null
                              svar: string
                          } | null
                          forventetHelsetilstandUtvikling: {
                              __typename: 'SporsmalSvar'
                              sporsmalstekst: string | null
                              svar: string
                          } | null
                          medisinskeHensyn: {
                              __typename: 'SporsmalSvar'
                              sporsmalstekst: string | null
                              svar: string
                          } | null
                      } | null
                  }
              }
            | {
                  __typename: 'SykmeldingLight'
                  sykmeldingId: string
                  documentStatus: Types.DocumentStatus | null
                  meta: {
                      __typename: 'SykmeldingMeta'
                      pasientIdent: string
                      sykmelderHpr: string
                      legekontorOrgnr: string | null
                      mottatt: string
                  }
                  utfall: { __typename: 'Outcome'; result: string; melding: string | null }
                  values: {
                      __typename: 'SykmeldingLightValues'
                      hoveddiagnose: {
                          __typename: 'Diagnose'
                          system: Types.DiagnoseSystem
                          code: string
                          text: string
                      } | null
                      bidiagnoser: Array<{
                          __typename: 'Diagnose'
                          system: Types.DiagnoseSystem
                          code: string
                          text: string
                      }> | null
                      aktivitet: Array<
                          | {
                                __typename: 'AktivitetIkkeMulig'
                                fom: string
                                tom: string
                                type: Types.AktivitetType
                                arbeidsrelatertArsak: {
                                    __typename: 'ArbeidsrelatertArsak'
                                    isArbeidsrelatertArsak: boolean
                                    arbeidsrelaterteArsaker: Array<Types.ArbeidsrelatertArsakType>
                                    annenArbeidsrelatertArsak: string | null
                                }
                            }
                          | {
                                __typename: 'Avventende'
                                fom: string
                                tom: string
                                type: Types.AktivitetType
                                innspillTilArbeidsgiver: string
                            }
                          | {
                                __typename: 'Behandlingsdager'
                                fom: string
                                tom: string
                                type: Types.AktivitetType
                                antallBehandlingsdager: number
                            }
                          | {
                                __typename: 'Gradert'
                                fom: string
                                tom: string
                                type: Types.AktivitetType
                                grad: number
                                reisetilskudd: boolean
                            }
                          | { __typename: 'Reisetilskudd'; fom: string; tom: string; type: Types.AktivitetType }
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
                      legekontorOrgnr: string | null
                      mottatt: string
                  }
                  utfall: { __typename: 'Outcome'; result: string; melding: string | null }
                  values: {
                      __typename: 'SykmeldingRedactedValues'
                      aktivitet: Array<{
                          __typename: 'AktivitetRedacted'
                          type: Types.AktivitetType
                          fom: string
                          tom: string
                      }>
                  }
              }
        >
    } | null
    konsultasjon: {
        __typename: 'Konsultasjon'
        hasRequestedAccessToSykmeldinger: boolean | null
        diagnoser: Array<{ __typename: 'Diagnose'; system: Types.DiagnoseSystem; code: string; text: string }> | null
    } | null
}

export type DiagnoseSearchQueryVariables = Exact<{
    query: string
}>

export type DiagnoseSearchQuery = {
    __typename: 'Query'
    diagnose: Array<{ __typename: 'Diagnose'; system: Types.DiagnoseSystem; code: string; text: string }> | null
}

export type DiagnoseFragment = { __typename: 'Diagnose'; system: Types.DiagnoseSystem; code: string; text: string }

export type SaveDraftMutationVariables = Exact<{
    draftId: string
    values: unknown
}>

export type SaveDraftMutation = {
    __typename: 'Mutation'
    saveDraft: { __typename: 'OpprettSykmeldingDraft'; draftId: string; values: unknown; lastUpdated: string }
}

export type DeleteDraftMutationVariables = Exact<{
    draftId: string
}>

export type DeleteDraftMutation = { __typename: 'Mutation'; deleteDraft: boolean }

export type GetDraftQueryVariables = Exact<{
    draftId: string
}>

export type GetDraftQuery = {
    __typename: 'Query'
    draft: { __typename: 'OpprettSykmeldingDraft'; draftId: string; values: unknown; lastUpdated: string } | null
}

export type GetAllDraftsQueryVariables = Exact<{ [key: string]: never }>

export type GetAllDraftsQuery = {
    __typename: 'Query'
    drafts: Array<{
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
    hasRequestedAccessToSykmeldinger: boolean | null
    diagnoser: Array<{ __typename: 'Diagnose'; system: Types.DiagnoseSystem; code: string; text: string }> | null
}

export type KonsultasjonQueryVariables = Exact<{ [key: string]: never }>

export type KonsultasjonQuery = {
    __typename: 'Query'
    konsultasjon: {
        __typename: 'Konsultasjon'
        hasRequestedAccessToSykmeldinger: boolean | null
        diagnoser: Array<{ __typename: 'Diagnose'; system: Types.DiagnoseSystem; code: string; text: string }> | null
    } | null
}

export type BehandlerFragment = {
    __typename: 'Behandler'
    navn: string
    hpr: string
    epost: string | null
    orgnummer: string | null
    legekontorTlf: string | null
}

export type BehandlerQueryVariables = Exact<{ [key: string]: never }>

export type BehandlerQuery = {
    __typename: 'Query'
    behandler: {
        __typename: 'Behandler'
        navn: string
        hpr: string
        epost: string | null
        orgnummer: string | null
        legekontorTlf: string | null
    } | null
}

export type PasientQueryVariables = Exact<{ [key: string]: never }>

export type PasientQuery = {
    __typename: 'Query'
    pasient: {
        __typename: 'Pasient'
        ident: string
        navn: string
        utdypendeSporsmal: {
            __typename: 'UtdypendeOpplysningerHint'
            days: number
            latestTom: string | null
            previouslyAnsweredSporsmal: Array<Types.UtdypendeSporsmalOptions>
        } | null
    } | null
}

export type ArbeidsforholdQueryVariables = Exact<{ [key: string]: never }>

export type ArbeidsforholdQuery = {
    __typename: 'Query'
    pasient: {
        __typename: 'Pasient'
        ident: string
        arbeidsforhold: Array<{ __typename: 'Arbeidsforhold'; navn: string; orgnummer: string }> | null
    } | null
}

export type PersonByIdentQueryVariables = Exact<{
    ident: string | null | undefined
}>

export type PersonByIdentQuery = {
    __typename: 'Query'
    person: { __typename: 'QueriedPerson'; ident: string; navn: string } | null
}

export type SykmeldingByIdQueryVariables = Exact<{
    id: string
}>

export type SykmeldingByIdQuery = {
    __typename: 'Query'
    sykmelding:
        | {
              __typename: 'SykmeldingFull'
              sykmeldingId: string
              documentStatus: Types.DocumentStatus | null
              meta: {
                  __typename: 'SykmeldingMeta'
                  pasientIdent: string
                  sykmelderHpr: string
                  legekontorOrgnr: string | null
                  mottatt: string
              }
              utfall: { __typename: 'Outcome'; result: string; melding: string | null }
              values: {
                  __typename: 'SykmeldingFullValues'
                  svangerskapsrelatert: boolean
                  pasientenSkalSkjermes: boolean
                  annenFravarsgrunn: Types.AnnenFravarsgrunnArsak | null
                  hoveddiagnose: {
                      __typename: 'Diagnose'
                      system: Types.DiagnoseSystem
                      code: string
                      text: string
                  } | null
                  bidiagnoser: Array<{
                      __typename: 'Diagnose'
                      system: Types.DiagnoseSystem
                      code: string
                      text: string
                  }> | null
                  aktivitet: Array<
                      | {
                            __typename: 'AktivitetIkkeMulig'
                            fom: string
                            tom: string
                            type: Types.AktivitetType
                            arbeidsrelatertArsak: {
                                __typename: 'ArbeidsrelatertArsak'
                                isArbeidsrelatertArsak: boolean
                                arbeidsrelaterteArsaker: Array<Types.ArbeidsrelatertArsakType>
                                annenArbeidsrelatertArsak: string | null
                            }
                        }
                      | {
                            __typename: 'Avventende'
                            fom: string
                            tom: string
                            type: Types.AktivitetType
                            innspillTilArbeidsgiver: string
                        }
                      | {
                            __typename: 'Behandlingsdager'
                            fom: string
                            tom: string
                            type: Types.AktivitetType
                            antallBehandlingsdager: number
                        }
                      | {
                            __typename: 'Gradert'
                            fom: string
                            tom: string
                            type: Types.AktivitetType
                            grad: number
                            reisetilskudd: boolean
                        }
                      | { __typename: 'Reisetilskudd'; fom: string; tom: string; type: Types.AktivitetType }
                  >
                  arbeidsgiver: { __typename: 'Arbeidsgiver'; harFlere: boolean; arbeidsgivernavn: string } | null
                  meldinger: {
                      __typename: 'SykmeldingMelding'
                      tilNav: string | null
                      tilArbeidsgiver: string | null
                  } | null
                  yrkesskade: { __typename: 'Yrkesskade'; yrkesskade: boolean; skadedato: string | null } | null
                  tilbakedatering: { __typename: 'Tilbakedatering'; startdato: string; begrunnelse: string } | null
                  utdypendeSporsmal: {
                      __typename: 'UtdypendeSporsmal'
                      utfordringerMedArbeid: string | null
                      medisinskOppsummering: string | null
                      hensynPaArbeidsplassen: string | null
                  } | null
                  utdypendeSporsmalSvar: {
                      __typename: 'UtdypendeSporsmalSvar'
                      utfordringerMedArbeid: {
                          __typename: 'SporsmalSvar'
                          sporsmalstekst: string | null
                          svar: string
                      } | null
                      medisinskOppsummering: {
                          __typename: 'SporsmalSvar'
                          sporsmalstekst: string | null
                          svar: string
                      } | null
                      hensynPaArbeidsplassen: {
                          __typename: 'SporsmalSvar'
                          sporsmalstekst: string | null
                          svar: string
                      } | null
                      sykdomsutvikling: {
                          __typename: 'SporsmalSvar'
                          sporsmalstekst: string | null
                          svar: string
                      } | null
                      arbeidsrelaterteUtfordringer: {
                          __typename: 'SporsmalSvar'
                          sporsmalstekst: string | null
                          svar: string
                      } | null
                      behandlingOgFremtidigArbeid: {
                          __typename: 'SporsmalSvar'
                          sporsmalstekst: string | null
                          svar: string
                      } | null
                      uavklarteForhold: {
                          __typename: 'SporsmalSvar'
                          sporsmalstekst: string | null
                          svar: string
                      } | null
                      oppdatertMedisinskStatus: {
                          __typename: 'SporsmalSvar'
                          sporsmalstekst: string | null
                          svar: string
                      } | null
                      realistiskMestringArbeid: {
                          __typename: 'SporsmalSvar'
                          sporsmalstekst: string | null
                          svar: string
                      } | null
                      forventetHelsetilstandUtvikling: {
                          __typename: 'SporsmalSvar'
                          sporsmalstekst: string | null
                          svar: string
                      } | null
                      medisinskeHensyn: {
                          __typename: 'SporsmalSvar'
                          sporsmalstekst: string | null
                          svar: string
                      } | null
                  } | null
              }
          }
        | {
              __typename: 'SykmeldingLight'
              sykmeldingId: string
              documentStatus: Types.DocumentStatus | null
              meta: {
                  __typename: 'SykmeldingMeta'
                  pasientIdent: string
                  sykmelderHpr: string
                  legekontorOrgnr: string | null
                  mottatt: string
              }
              utfall: { __typename: 'Outcome'; result: string; melding: string | null }
              values: {
                  __typename: 'SykmeldingLightValues'
                  hoveddiagnose: {
                      __typename: 'Diagnose'
                      system: Types.DiagnoseSystem
                      code: string
                      text: string
                  } | null
                  bidiagnoser: Array<{
                      __typename: 'Diagnose'
                      system: Types.DiagnoseSystem
                      code: string
                      text: string
                  }> | null
                  aktivitet: Array<
                      | {
                            __typename: 'AktivitetIkkeMulig'
                            fom: string
                            tom: string
                            type: Types.AktivitetType
                            arbeidsrelatertArsak: {
                                __typename: 'ArbeidsrelatertArsak'
                                isArbeidsrelatertArsak: boolean
                                arbeidsrelaterteArsaker: Array<Types.ArbeidsrelatertArsakType>
                                annenArbeidsrelatertArsak: string | null
                            }
                        }
                      | {
                            __typename: 'Avventende'
                            fom: string
                            tom: string
                            type: Types.AktivitetType
                            innspillTilArbeidsgiver: string
                        }
                      | {
                            __typename: 'Behandlingsdager'
                            fom: string
                            tom: string
                            type: Types.AktivitetType
                            antallBehandlingsdager: number
                        }
                      | {
                            __typename: 'Gradert'
                            fom: string
                            tom: string
                            type: Types.AktivitetType
                            grad: number
                            reisetilskudd: boolean
                        }
                      | { __typename: 'Reisetilskudd'; fom: string; tom: string; type: Types.AktivitetType }
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
                  legekontorOrgnr: string | null
                  mottatt: string
              }
              utfall: { __typename: 'Outcome'; result: string; melding: string | null }
              values: {
                  __typename: 'SykmeldingRedactedValues'
                  aktivitet: Array<{
                      __typename: 'AktivitetRedacted'
                      type: Types.AktivitetType
                      fom: string
                      tom: string
                  }>
              }
          }
        | null
}

export type OpprettSykmeldingMutationVariables = Exact<{
    draftId: string
    meta: Types.OpprettSykmeldingMetaInput
    values: Types.OpprettSykmeldingInput
    force?: boolean
}>

export type OpprettSykmeldingMutation = {
    __typename: 'Mutation'
    opprettSykmelding:
        | { __typename: 'OtherSubmitOutcomes'; cause: Types.OtherSubmitOutcomesEnum }
        | { __typename: 'RuleOutcome'; status: Types.RuleOutcomeStatus; message: string; rule: string }
        | {
              __typename: 'SykmeldingFull'
              sykmeldingId: string
              documentStatus: Types.DocumentStatus | null
              meta: {
                  __typename: 'SykmeldingMeta'
                  pasientIdent: string
                  sykmelderHpr: string
                  legekontorOrgnr: string | null
                  mottatt: string
              }
              utfall: { __typename: 'Outcome'; result: string; melding: string | null }
              values: {
                  __typename: 'SykmeldingFullValues'
                  svangerskapsrelatert: boolean
                  pasientenSkalSkjermes: boolean
                  annenFravarsgrunn: Types.AnnenFravarsgrunnArsak | null
                  hoveddiagnose: {
                      __typename: 'Diagnose'
                      system: Types.DiagnoseSystem
                      code: string
                      text: string
                  } | null
                  bidiagnoser: Array<{
                      __typename: 'Diagnose'
                      system: Types.DiagnoseSystem
                      code: string
                      text: string
                  }> | null
                  aktivitet: Array<
                      | {
                            __typename: 'AktivitetIkkeMulig'
                            fom: string
                            tom: string
                            type: Types.AktivitetType
                            arbeidsrelatertArsak: {
                                __typename: 'ArbeidsrelatertArsak'
                                isArbeidsrelatertArsak: boolean
                                arbeidsrelaterteArsaker: Array<Types.ArbeidsrelatertArsakType>
                                annenArbeidsrelatertArsak: string | null
                            }
                        }
                      | {
                            __typename: 'Avventende'
                            fom: string
                            tom: string
                            type: Types.AktivitetType
                            innspillTilArbeidsgiver: string
                        }
                      | {
                            __typename: 'Behandlingsdager'
                            fom: string
                            tom: string
                            type: Types.AktivitetType
                            antallBehandlingsdager: number
                        }
                      | {
                            __typename: 'Gradert'
                            fom: string
                            tom: string
                            type: Types.AktivitetType
                            grad: number
                            reisetilskudd: boolean
                        }
                      | { __typename: 'Reisetilskudd'; fom: string; tom: string; type: Types.AktivitetType }
                  >
                  arbeidsgiver: { __typename: 'Arbeidsgiver'; harFlere: boolean; arbeidsgivernavn: string } | null
                  meldinger: {
                      __typename: 'SykmeldingMelding'
                      tilNav: string | null
                      tilArbeidsgiver: string | null
                  } | null
                  yrkesskade: { __typename: 'Yrkesskade'; yrkesskade: boolean; skadedato: string | null } | null
                  tilbakedatering: { __typename: 'Tilbakedatering'; startdato: string; begrunnelse: string } | null
                  utdypendeSporsmal: {
                      __typename: 'UtdypendeSporsmal'
                      utfordringerMedArbeid: string | null
                      medisinskOppsummering: string | null
                      hensynPaArbeidsplassen: string | null
                  } | null
                  utdypendeSporsmalSvar: {
                      __typename: 'UtdypendeSporsmalSvar'
                      utfordringerMedArbeid: {
                          __typename: 'SporsmalSvar'
                          sporsmalstekst: string | null
                          svar: string
                      } | null
                      medisinskOppsummering: {
                          __typename: 'SporsmalSvar'
                          sporsmalstekst: string | null
                          svar: string
                      } | null
                      hensynPaArbeidsplassen: {
                          __typename: 'SporsmalSvar'
                          sporsmalstekst: string | null
                          svar: string
                      } | null
                      sykdomsutvikling: {
                          __typename: 'SporsmalSvar'
                          sporsmalstekst: string | null
                          svar: string
                      } | null
                      arbeidsrelaterteUtfordringer: {
                          __typename: 'SporsmalSvar'
                          sporsmalstekst: string | null
                          svar: string
                      } | null
                      behandlingOgFremtidigArbeid: {
                          __typename: 'SporsmalSvar'
                          sporsmalstekst: string | null
                          svar: string
                      } | null
                      uavklarteForhold: {
                          __typename: 'SporsmalSvar'
                          sporsmalstekst: string | null
                          svar: string
                      } | null
                      oppdatertMedisinskStatus: {
                          __typename: 'SporsmalSvar'
                          sporsmalstekst: string | null
                          svar: string
                      } | null
                      realistiskMestringArbeid: {
                          __typename: 'SporsmalSvar'
                          sporsmalstekst: string | null
                          svar: string
                      } | null
                      forventetHelsetilstandUtvikling: {
                          __typename: 'SporsmalSvar'
                          sporsmalstekst: string | null
                          svar: string
                      } | null
                      medisinskeHensyn: {
                          __typename: 'SporsmalSvar'
                          sporsmalstekst: string | null
                          svar: string
                      } | null
                  } | null
              }
          }
}

export type RuleOutcomeFragment = {
    __typename: 'RuleOutcome'
    status: Types.RuleOutcomeStatus
    message: string
    rule: string
}

export type SykmeldingRedactedFragment = {
    __typename: 'SykmeldingRedacted'
    sykmeldingId: string
    meta: {
        __typename: 'SykmeldingMeta'
        pasientIdent: string
        sykmelderHpr: string
        legekontorOrgnr: string | null
        mottatt: string
    }
    utfall: { __typename: 'Outcome'; result: string; melding: string | null }
    values: {
        __typename: 'SykmeldingRedactedValues'
        aktivitet: Array<{ __typename: 'AktivitetRedacted'; type: Types.AktivitetType; fom: string; tom: string }>
    }
}

export type SykmeldingFullFragment = {
    __typename: 'SykmeldingFull'
    sykmeldingId: string
    documentStatus: Types.DocumentStatus | null
    meta: {
        __typename: 'SykmeldingMeta'
        pasientIdent: string
        sykmelderHpr: string
        legekontorOrgnr: string | null
        mottatt: string
    }
    utfall: { __typename: 'Outcome'; result: string; melding: string | null }
    values: {
        __typename: 'SykmeldingFullValues'
        svangerskapsrelatert: boolean
        pasientenSkalSkjermes: boolean
        annenFravarsgrunn: Types.AnnenFravarsgrunnArsak | null
        hoveddiagnose: { __typename: 'Diagnose'; system: Types.DiagnoseSystem; code: string; text: string } | null
        bidiagnoser: Array<{ __typename: 'Diagnose'; system: Types.DiagnoseSystem; code: string; text: string }> | null
        aktivitet: Array<
            | {
                  __typename: 'AktivitetIkkeMulig'
                  fom: string
                  tom: string
                  type: Types.AktivitetType
                  arbeidsrelatertArsak: {
                      __typename: 'ArbeidsrelatertArsak'
                      isArbeidsrelatertArsak: boolean
                      arbeidsrelaterteArsaker: Array<Types.ArbeidsrelatertArsakType>
                      annenArbeidsrelatertArsak: string | null
                  }
              }
            | {
                  __typename: 'Avventende'
                  fom: string
                  tom: string
                  type: Types.AktivitetType
                  innspillTilArbeidsgiver: string
              }
            | {
                  __typename: 'Behandlingsdager'
                  fom: string
                  tom: string
                  type: Types.AktivitetType
                  antallBehandlingsdager: number
              }
            | {
                  __typename: 'Gradert'
                  fom: string
                  tom: string
                  type: Types.AktivitetType
                  grad: number
                  reisetilskudd: boolean
              }
            | { __typename: 'Reisetilskudd'; fom: string; tom: string; type: Types.AktivitetType }
        >
        arbeidsgiver: { __typename: 'Arbeidsgiver'; harFlere: boolean; arbeidsgivernavn: string } | null
        meldinger: { __typename: 'SykmeldingMelding'; tilNav: string | null; tilArbeidsgiver: string | null } | null
        yrkesskade: { __typename: 'Yrkesskade'; yrkesskade: boolean; skadedato: string | null } | null
        tilbakedatering: { __typename: 'Tilbakedatering'; startdato: string; begrunnelse: string } | null
        utdypendeSporsmal: {
            __typename: 'UtdypendeSporsmal'
            utfordringerMedArbeid: string | null
            medisinskOppsummering: string | null
            hensynPaArbeidsplassen: string | null
        } | null
        utdypendeSporsmalSvar: {
            __typename: 'UtdypendeSporsmalSvar'
            utfordringerMedArbeid: { __typename: 'SporsmalSvar'; sporsmalstekst: string | null; svar: string } | null
            medisinskOppsummering: { __typename: 'SporsmalSvar'; sporsmalstekst: string | null; svar: string } | null
            hensynPaArbeidsplassen: { __typename: 'SporsmalSvar'; sporsmalstekst: string | null; svar: string } | null
            sykdomsutvikling: { __typename: 'SporsmalSvar'; sporsmalstekst: string | null; svar: string } | null
            arbeidsrelaterteUtfordringer: {
                __typename: 'SporsmalSvar'
                sporsmalstekst: string | null
                svar: string
            } | null
            behandlingOgFremtidigArbeid: {
                __typename: 'SporsmalSvar'
                sporsmalstekst: string | null
                svar: string
            } | null
            uavklarteForhold: { __typename: 'SporsmalSvar'; sporsmalstekst: string | null; svar: string } | null
            oppdatertMedisinskStatus: { __typename: 'SporsmalSvar'; sporsmalstekst: string | null; svar: string } | null
            realistiskMestringArbeid: { __typename: 'SporsmalSvar'; sporsmalstekst: string | null; svar: string } | null
            forventetHelsetilstandUtvikling: {
                __typename: 'SporsmalSvar'
                sporsmalstekst: string | null
                svar: string
            } | null
            medisinskeHensyn: { __typename: 'SporsmalSvar'; sporsmalstekst: string | null; svar: string } | null
        } | null
    }
}

export type SykmeldingLightFragment = {
    __typename: 'SykmeldingLight'
    sykmeldingId: string
    documentStatus: Types.DocumentStatus | null
    meta: {
        __typename: 'SykmeldingMeta'
        pasientIdent: string
        sykmelderHpr: string
        legekontorOrgnr: string | null
        mottatt: string
    }
    utfall: { __typename: 'Outcome'; result: string; melding: string | null }
    values: {
        __typename: 'SykmeldingLightValues'
        hoveddiagnose: { __typename: 'Diagnose'; system: Types.DiagnoseSystem; code: string; text: string } | null
        bidiagnoser: Array<{ __typename: 'Diagnose'; system: Types.DiagnoseSystem; code: string; text: string }> | null
        aktivitet: Array<
            | {
                  __typename: 'AktivitetIkkeMulig'
                  fom: string
                  tom: string
                  type: Types.AktivitetType
                  arbeidsrelatertArsak: {
                      __typename: 'ArbeidsrelatertArsak'
                      isArbeidsrelatertArsak: boolean
                      arbeidsrelaterteArsaker: Array<Types.ArbeidsrelatertArsakType>
                      annenArbeidsrelatertArsak: string | null
                  }
              }
            | {
                  __typename: 'Avventende'
                  fom: string
                  tom: string
                  type: Types.AktivitetType
                  innspillTilArbeidsgiver: string
              }
            | {
                  __typename: 'Behandlingsdager'
                  fom: string
                  tom: string
                  type: Types.AktivitetType
                  antallBehandlingsdager: number
              }
            | {
                  __typename: 'Gradert'
                  fom: string
                  tom: string
                  type: Types.AktivitetType
                  grad: number
                  reisetilskudd: boolean
              }
            | { __typename: 'Reisetilskudd'; fom: string; tom: string; type: Types.AktivitetType }
        >
    }
}

export type RequestAccessToSykmeldingerMutationVariables = Exact<{ [key: string]: never }>

export type RequestAccessToSykmeldingerMutation = { __typename: 'Mutation'; requestAccessToSykmeldinger: boolean }

type Sykmelding_SykmeldingFull_Fragment = {
    __typename: 'SykmeldingFull'
    sykmeldingId: string
    documentStatus: Types.DocumentStatus | null
    meta: {
        __typename: 'SykmeldingMeta'
        pasientIdent: string
        sykmelderHpr: string
        legekontorOrgnr: string | null
        mottatt: string
    }
    utfall: { __typename: 'Outcome'; result: string; melding: string | null }
    values: {
        __typename: 'SykmeldingFullValues'
        svangerskapsrelatert: boolean
        pasientenSkalSkjermes: boolean
        annenFravarsgrunn: Types.AnnenFravarsgrunnArsak | null
        hoveddiagnose: { __typename: 'Diagnose'; system: Types.DiagnoseSystem; code: string; text: string } | null
        bidiagnoser: Array<{ __typename: 'Diagnose'; system: Types.DiagnoseSystem; code: string; text: string }> | null
        aktivitet: Array<
            | {
                  __typename: 'AktivitetIkkeMulig'
                  fom: string
                  tom: string
                  type: Types.AktivitetType
                  arbeidsrelatertArsak: {
                      __typename: 'ArbeidsrelatertArsak'
                      isArbeidsrelatertArsak: boolean
                      arbeidsrelaterteArsaker: Array<Types.ArbeidsrelatertArsakType>
                      annenArbeidsrelatertArsak: string | null
                  }
              }
            | {
                  __typename: 'Avventende'
                  fom: string
                  tom: string
                  type: Types.AktivitetType
                  innspillTilArbeidsgiver: string
              }
            | {
                  __typename: 'Behandlingsdager'
                  fom: string
                  tom: string
                  type: Types.AktivitetType
                  antallBehandlingsdager: number
              }
            | {
                  __typename: 'Gradert'
                  fom: string
                  tom: string
                  type: Types.AktivitetType
                  grad: number
                  reisetilskudd: boolean
              }
            | { __typename: 'Reisetilskudd'; fom: string; tom: string; type: Types.AktivitetType }
        >
        arbeidsgiver: { __typename: 'Arbeidsgiver'; harFlere: boolean; arbeidsgivernavn: string } | null
        meldinger: { __typename: 'SykmeldingMelding'; tilNav: string | null; tilArbeidsgiver: string | null } | null
        yrkesskade: { __typename: 'Yrkesskade'; yrkesskade: boolean; skadedato: string | null } | null
        tilbakedatering: { __typename: 'Tilbakedatering'; startdato: string; begrunnelse: string } | null
        utdypendeSporsmal: {
            __typename: 'UtdypendeSporsmal'
            utfordringerMedArbeid: string | null
            medisinskOppsummering: string | null
            hensynPaArbeidsplassen: string | null
        } | null
        utdypendeSporsmalSvar: {
            __typename: 'UtdypendeSporsmalSvar'
            utfordringerMedArbeid: { __typename: 'SporsmalSvar'; sporsmalstekst: string | null; svar: string } | null
            medisinskOppsummering: { __typename: 'SporsmalSvar'; sporsmalstekst: string | null; svar: string } | null
            hensynPaArbeidsplassen: { __typename: 'SporsmalSvar'; sporsmalstekst: string | null; svar: string } | null
            sykdomsutvikling: { __typename: 'SporsmalSvar'; sporsmalstekst: string | null; svar: string } | null
            arbeidsrelaterteUtfordringer: {
                __typename: 'SporsmalSvar'
                sporsmalstekst: string | null
                svar: string
            } | null
            behandlingOgFremtidigArbeid: {
                __typename: 'SporsmalSvar'
                sporsmalstekst: string | null
                svar: string
            } | null
            uavklarteForhold: { __typename: 'SporsmalSvar'; sporsmalstekst: string | null; svar: string } | null
            oppdatertMedisinskStatus: { __typename: 'SporsmalSvar'; sporsmalstekst: string | null; svar: string } | null
            realistiskMestringArbeid: { __typename: 'SporsmalSvar'; sporsmalstekst: string | null; svar: string } | null
            forventetHelsetilstandUtvikling: {
                __typename: 'SporsmalSvar'
                sporsmalstekst: string | null
                svar: string
            } | null
            medisinskeHensyn: { __typename: 'SporsmalSvar'; sporsmalstekst: string | null; svar: string } | null
        } | null
    }
}

type Sykmelding_SykmeldingLight_Fragment = {
    __typename: 'SykmeldingLight'
    sykmeldingId: string
    documentStatus: Types.DocumentStatus | null
    meta: {
        __typename: 'SykmeldingMeta'
        pasientIdent: string
        sykmelderHpr: string
        legekontorOrgnr: string | null
        mottatt: string
    }
    utfall: { __typename: 'Outcome'; result: string; melding: string | null }
    values: {
        __typename: 'SykmeldingLightValues'
        hoveddiagnose: { __typename: 'Diagnose'; system: Types.DiagnoseSystem; code: string; text: string } | null
        bidiagnoser: Array<{ __typename: 'Diagnose'; system: Types.DiagnoseSystem; code: string; text: string }> | null
        aktivitet: Array<
            | {
                  __typename: 'AktivitetIkkeMulig'
                  fom: string
                  tom: string
                  type: Types.AktivitetType
                  arbeidsrelatertArsak: {
                      __typename: 'ArbeidsrelatertArsak'
                      isArbeidsrelatertArsak: boolean
                      arbeidsrelaterteArsaker: Array<Types.ArbeidsrelatertArsakType>
                      annenArbeidsrelatertArsak: string | null
                  }
              }
            | {
                  __typename: 'Avventende'
                  fom: string
                  tom: string
                  type: Types.AktivitetType
                  innspillTilArbeidsgiver: string
              }
            | {
                  __typename: 'Behandlingsdager'
                  fom: string
                  tom: string
                  type: Types.AktivitetType
                  antallBehandlingsdager: number
              }
            | {
                  __typename: 'Gradert'
                  fom: string
                  tom: string
                  type: Types.AktivitetType
                  grad: number
                  reisetilskudd: boolean
              }
            | { __typename: 'Reisetilskudd'; fom: string; tom: string; type: Types.AktivitetType }
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
        legekontorOrgnr: string | null
        mottatt: string
    }
    utfall: { __typename: 'Outcome'; result: string; melding: string | null }
    values: {
        __typename: 'SykmeldingRedactedValues'
        aktivitet: Array<{ __typename: 'AktivitetRedacted'; type: Types.AktivitetType; fom: string; tom: string }>
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
    type: Types.AktivitetType
    arbeidsrelatertArsak: {
        __typename: 'ArbeidsrelatertArsak'
        isArbeidsrelatertArsak: boolean
        arbeidsrelaterteArsaker: Array<Types.ArbeidsrelatertArsakType>
        annenArbeidsrelatertArsak: string | null
    }
}

type Aktivitet_Avventende_Fragment = {
    __typename: 'Avventende'
    fom: string
    tom: string
    type: Types.AktivitetType
    innspillTilArbeidsgiver: string
}

type Aktivitet_Behandlingsdager_Fragment = {
    __typename: 'Behandlingsdager'
    fom: string
    tom: string
    type: Types.AktivitetType
    antallBehandlingsdager: number
}

type Aktivitet_Gradert_Fragment = {
    __typename: 'Gradert'
    fom: string
    tom: string
    type: Types.AktivitetType
    grad: number
    reisetilskudd: boolean
}

type Aktivitet_Reisetilskudd_Fragment = {
    __typename: 'Reisetilskudd'
    fom: string
    tom: string
    type: Types.AktivitetType
}

export type AktivitetFragment =
    | Aktivitet_AktivitetIkkeMulig_Fragment
    | Aktivitet_Avventende_Fragment
    | Aktivitet_Behandlingsdager_Fragment
    | Aktivitet_Gradert_Fragment
    | Aktivitet_Reisetilskudd_Fragment

export type SynchronizeSykmeldingMutationVariables = Exact<{
    id: string
}>

export type SynchronizeSykmeldingMutation = {
    __typename: 'Mutation'
    synchronizeSykmelding: {
        __typename: 'SynchronizationStatus'
        documentStatus: Types.DocumentStatus
        navStatus: Types.DocumentStatus
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
export const BehandlerFragmentDoc = {
    kind: 'Document',
    definitions: [
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'Behandler' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Behandler' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'navn' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'hpr' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'epost' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'orgnummer' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'legekontorTlf' } },
                ],
            },
        },
    ],
} as unknown as DocumentNode<BehandlerFragment, unknown>
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
                                { kind: 'Field', name: { kind: 'Name', value: 'melding' } },
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
                                { kind: 'Field', name: { kind: 'Name', value: 'reisetilskudd' } },
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
                                { kind: 'Field', name: { kind: 'Name', value: 'melding' } },
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
                                            { kind: 'Field', name: { kind: 'Name', value: 'utfordringerMedArbeid' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'medisinskOppsummering' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'hensynPaArbeidsplassen' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'utdypendeSporsmalSvar' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'utfordringerMedArbeid' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'medisinskOppsummering' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'hensynPaArbeidsplassen' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'sykdomsutvikling' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'arbeidsrelaterteUtfordringer' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'behandlingOgFremtidigArbeid' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'uavklarteForhold' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'oppdatertMedisinskStatus' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'realistiskMestringArbeid' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'forventetHelsetilstandUtvikling' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'medisinskeHensyn' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                        ],
                                    },
                                },
                                { kind: 'Field', name: { kind: 'Name', value: 'annenFravarsgrunn' } },
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
                                { kind: 'Field', name: { kind: 'Name', value: 'reisetilskudd' } },
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
                                { kind: 'Field', name: { kind: 'Name', value: 'melding' } },
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
                                { kind: 'Field', name: { kind: 'Name', value: 'reisetilskudd' } },
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
                                { kind: 'Field', name: { kind: 'Name', value: 'reisetilskudd' } },
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
                                { kind: 'Field', name: { kind: 'Name', value: 'melding' } },
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
                                { kind: 'Field', name: { kind: 'Name', value: 'melding' } },
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
                                            { kind: 'Field', name: { kind: 'Name', value: 'utfordringerMedArbeid' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'medisinskOppsummering' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'hensynPaArbeidsplassen' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'utdypendeSporsmalSvar' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'utfordringerMedArbeid' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'medisinskOppsummering' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'hensynPaArbeidsplassen' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'sykdomsutvikling' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'arbeidsrelaterteUtfordringer' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'behandlingOgFremtidigArbeid' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'uavklarteForhold' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'oppdatertMedisinskStatus' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'realistiskMestringArbeid' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'forventetHelsetilstandUtvikling' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'medisinskeHensyn' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                        ],
                                    },
                                },
                                { kind: 'Field', name: { kind: 'Name', value: 'annenFravarsgrunn' } },
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
                                { kind: 'Field', name: { kind: 'Name', value: 'melding' } },
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
                                { kind: 'Field', name: { kind: 'Name', value: 'melding' } },
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
                                { kind: 'Field', name: { kind: 'Name', value: 'reisetilskudd' } },
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
                                { kind: 'Field', name: { kind: 'Name', value: 'melding' } },
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
                                            { kind: 'Field', name: { kind: 'Name', value: 'utfordringerMedArbeid' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'medisinskOppsummering' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'hensynPaArbeidsplassen' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'utdypendeSporsmalSvar' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'utfordringerMedArbeid' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'medisinskOppsummering' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'hensynPaArbeidsplassen' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'sykdomsutvikling' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'arbeidsrelaterteUtfordringer' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'behandlingOgFremtidigArbeid' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'uavklarteForhold' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'oppdatertMedisinskStatus' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'realistiskMestringArbeid' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'forventetHelsetilstandUtvikling' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'medisinskeHensyn' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                        ],
                                    },
                                },
                                { kind: 'Field', name: { kind: 'Name', value: 'annenFravarsgrunn' } },
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
                                { kind: 'Field', name: { kind: 'Name', value: 'melding' } },
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
                                name: { kind: 'Name', value: 'systems' },
                                value: {
                                    kind: 'ListValue',
                                    values: [
                                        { kind: 'EnumValue', value: 'ICPC2' },
                                        { kind: 'EnumValue', value: 'ICPC2B' },
                                    ],
                                },
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
                            selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'Behandler' } }],
                        },
                    },
                ],
            },
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'Behandler' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Behandler' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'navn' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'hpr' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'epost' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'orgnummer' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'legekontorTlf' } },
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
                                { kind: 'Field', name: { kind: 'Name', value: 'melding' } },
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
                                { kind: 'Field', name: { kind: 'Name', value: 'reisetilskudd' } },
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
                                { kind: 'Field', name: { kind: 'Name', value: 'melding' } },
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
                                            { kind: 'Field', name: { kind: 'Name', value: 'utfordringerMedArbeid' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'medisinskOppsummering' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'hensynPaArbeidsplassen' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'utdypendeSporsmalSvar' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'utfordringerMedArbeid' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'medisinskOppsummering' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'hensynPaArbeidsplassen' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'sykdomsutvikling' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'arbeidsrelaterteUtfordringer' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'behandlingOgFremtidigArbeid' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'uavklarteForhold' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'oppdatertMedisinskStatus' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'realistiskMestringArbeid' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'forventetHelsetilstandUtvikling' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'medisinskeHensyn' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                        ],
                                    },
                                },
                                { kind: 'Field', name: { kind: 'Name', value: 'annenFravarsgrunn' } },
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
                                { kind: 'Field', name: { kind: 'Name', value: 'melding' } },
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
                                { kind: 'Field', name: { kind: 'Name', value: 'melding' } },
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
                                { kind: 'Field', name: { kind: 'Name', value: 'reisetilskudd' } },
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
                                { kind: 'Field', name: { kind: 'Name', value: 'melding' } },
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
                                            { kind: 'Field', name: { kind: 'Name', value: 'utfordringerMedArbeid' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'medisinskOppsummering' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'hensynPaArbeidsplassen' } },
                                        ],
                                    },
                                },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'utdypendeSporsmalSvar' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'utfordringerMedArbeid' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'medisinskOppsummering' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'hensynPaArbeidsplassen' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'sykdomsutvikling' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'arbeidsrelaterteUtfordringer' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'behandlingOgFremtidigArbeid' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'uavklarteForhold' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'oppdatertMedisinskStatus' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'realistiskMestringArbeid' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'forventetHelsetilstandUtvikling' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                            {
                                                kind: 'Field',
                                                name: { kind: 'Name', value: 'medisinskeHensyn' },
                                                selectionSet: {
                                                    kind: 'SelectionSet',
                                                    selections: [
                                                        {
                                                            kind: 'Field',
                                                            name: { kind: 'Name', value: 'sporsmalstekst' },
                                                        },
                                                        { kind: 'Field', name: { kind: 'Name', value: 'svar' } },
                                                    ],
                                                },
                                            },
                                        ],
                                    },
                                },
                                { kind: 'Field', name: { kind: 'Name', value: 'annenFravarsgrunn' } },
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
                                { kind: 'Field', name: { kind: 'Name', value: 'melding' } },
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
