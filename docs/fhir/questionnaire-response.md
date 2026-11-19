# QuestionnaireResponse

Navs behov: **Skrive**

_Relevante referanser:_

- [QuestionnaireResponse](https://www.hl7.org/fhir/R4/questionnaireresponse.html) (HL7)
- [Questionnaire](https://www.hl7.org/fhir/R4/questionnaire.html) (HL7)
- [ADR01 - FHIR resources for writing data back to EHR](../adr/ADR01%20-%20FHIR%20resources%20for%20writing%20data%20back%20to%20EHR.md)

QuestionnaireResponse skrives som en selvstendig ressurs til FHIR-serveren og inneholder alle
strukturerte sykmeldingsdata som `item`. Den refererer alltid til den offentlig tilgjengelige
Questionnaire-definisjonen via kanonisk URL:

```
https://www.nav.no/samarbeidspartner/sykmelding/fhir/R4/Questionnaire/V1
```

EPJ kan slå opp definisjonen for å forstå strukturen til de ulike `item`-feltene.

## Eksempel JSON-struktur for _QuestionnaireResponse_

```json
{
  "resourceType": "QuestionnaireResponse",
  "id": "id-en til sykmeldingen (samme som DocumentReference)",
  "questionnaire": "https://www.nav.no/samarbeidspartner/sykmelding/fhir/R4/Questionnaire/V1",
  "status": "completed",
  "subject": {
    "reference": "Patient/<Pasienten sykmeldingen gjelder for>"
  },
  "encounter": {
    "reference": "Encounter/<Referanse til aktiv konsultasjon>"
  },
  "authored": "2026-02-10T09:30:00+01:00",
  "author": {
    "reference": "Practitioner/<Sykmelder som fylte ut sykmeldingen>"
  },
  "item": [
    {
      "linkId": "hoveddiagnose",
      "answer": [
        {
          "valueCoding": {
            "system": "urn:oid:2.16.578.1.12.4.1.1.7110",
            "code": "M54.5",
            "display": "Korsryggsmerter"
          }
        }
      ]
    },
    {
      "linkId": "bidiagnose",
      "answer": [
        {
          "valueCoding": {
            "system": "urn:oid:2.16.578.1.12.4.1.1.7110",
            "code": "F32.0",
            "display": "Mild depressiv episode"
          }
        },
        {
          "valueCoding": {
            "system": "urn:oid:2.16.578.1.12.4.1.1.7110",
            "code": "G47.0",
            "display": "Søvnløshet"
          }
        }
      ]
    },
    {
      "linkId": "aktivitet",
      "item": [
        {
          "linkId": "aktivitet-type",
          "answer": [
            {
              "valueCoding": {
                "code": "AKTIVITET_IKKE_MULIG",
                "display": "Aktivitet ikke mulig"
              }
            }
          ]
        },
        {
          "linkId": "aktivitet-fom",
          "answer": [
            {
              "valueDate": "2026-02-10"
            }
          ]
        },
        {
          "linkId": "aktivitet-tom",
          "answer": [
            {
              "valueDate": "2026-02-24"
            }
          ]
        }
      ]
    },
    {
      "linkId": "aktivitet",
      "item": [
        {
          "linkId": "aktivitet-type",
          "answer": [
            {
              "valueCoding": {
                "code": "GRADERT",
                "display": "Gradert"
              }
            }
          ]
        },
        {
          "linkId": "aktivitet-fom",
          "answer": [
            {
              "valueDate": "2026-02-25"
            }
          ]
        },
        {
          "linkId": "aktivitet-tom",
          "answer": [
            {
              "valueDate": "2026-03-24"
            }
          ]
        },
        {
          "linkId": "aktivitet-grad",
          "answer": [
            {
              "valueInteger": 60
            }
          ]
        }
      ]
    },
    {
      "linkId": "svangerskapsrelatert",
      "answer": [
        {
          "valueBoolean": false
        }
      ]
    },
    {
      "linkId": "annen-fravarsgrunn",
      "answer": [
        {
          "valueCoding": {
            "code": "NODVENDIG_KONTROLLUNDENRSOKELSE",
            "display": "Nødvendig kontrollundersøkelse"
          }
        }
      ]
    },
    {
      "linkId": "yrkesskade",
      "item": [
        {
          "linkId": "yrkesskade-er-yrkesskade",
          "answer": [
            {
              "valueBoolean": true
            }
          ]
        },
        {
          "linkId": "yrkesskade-skadedato",
          "answer": [
            {
              "valueDate": "2025-06-15"
            }
          ]
        }
      ]
    },
    {
      "linkId": "arbeidsforhold",
      "item": [
        {
          "linkId": "arbeidsforhold-arbeidsgivernavn",
          "answer": [
            {
              "valueString": "Arbeidsgiver AS"
            }
          ]
        }
      ]
    }
  ]
}
```

## Krav

QuestionnaireResponse er valgfri. Skriving er best-effort, og feil stopper ikke DocumentReference.

| Felt            | R4    | Verdi                                       |
| --------------- | ----- | ------------------------------------------- |
| `status`        | 1..1  | `completed`                                 |
| `questionnaire` | 0..1  | Kanonisk URL til Questionnaire-definisjonen |
| `subject`       | 0..1  | `Patient/<id>` fra launch-konteksten        |
| `encounter`     | 0..1  | `Encounter/<id>` fra launch-konteksten      |
| `author`        | 0..1  | `Practitioner/<id>` fra launch-konteksten   |
| `authored`      | 0..1  | Tidspunkt for innsending                    |
| `item`          | 0..\* | Sykmeldingsdata, se under                   |

### Skriving

| Steg                             | Forventet svar                                                                                      |
| -------------------------------- | --------------------------------------------------------------------------------------------------- |
| `GET QuestionnaireResponse/<id>` | `404` hvis ressursen ikke finnes. Finnes den, skrives den ikke på nytt.                             |
| `PUT QuestionnaireResponse/<id>` | Hele ressursen i body. `404`, `405` og `501` betyr at skriving ikke støttes, og steget hoppes over. |

Id-en settes av syk-inn. Svar uten body regnes som feil, selv om R4 tillater det
([navikt/smart-on-fhir#104](https://github.com/navikt/smart-on-fhir/issues/104)).

## Begrunnelse

- `id` settes til sykmeldings-id-en, den samme id-en som benyttes for
  [DocumentReference](document-reference.md). Siden FHIR-identiteten er `<ressurstype>/<id>`, kan de
  to ressursene dele samme id-verdi, og DocumentReference kan referere til QuestionnaireResponse via
  `context.related` (se [Bundle](bundle.md)).
- `questionnaire` refererer til den offentlig publiserte Questionnaire-definisjonen via kanonisk
  URL. EPJ kan slå opp definisjonen for å forstå strukturen.
- `status` er satt til `completed` fordi sykmeldingen er ferdig utfylt.
- `subject` er en referanse til pasienten sykmeldingen gjelder for.
- `encounter` knytter svaret til den aktive konsultasjonen.
- `author` er en referanse til sykmelder som fylte ut sykmeldingen, og `authored` er tidspunktet.
- `item` inneholder alle strukturerte sykmeldingsdata. Verdier representeres med `valueCoding`,
  `valueDate`, `valueInteger`, `valueBoolean` eller `valueString` avhengig av felt.
  - `hoveddiagnose` og `bidiagnose` er `valueCoding` med kodesystem (ICD-10
    `urn:oid:2.16.578.1.12.4.1.1.7110` eller ICPC-2 `urn:oid:2.16.578.1.12.4.1.1.7170`), kode og
    visningstekst. Ingen egen Condition-ressurs benyttes. `bidiagnose` er ett `item` med ett
    `answer` per bidiagnose, og utelates når det ikke finnes noen bidiagnoser. `hoveddiagnose` er
    ikke påkrevd i Questionnaire-definisjonen og utelates når sykmeldingen ikke har hoveddiagnose,
    for eksempel ved en annen lovfestet fraværsgrunn.
  - `aktivitet` er en gruppe med periode (`aktivitet-fom`/`aktivitet-tom`) og type. Flere perioder
    representeres ved å gjenta `aktivitet`-gruppen. `aktivitet-grad` inkluderes kun for type
    `GRADERT`.
  - `svangerskapsrelatert` er `valueBoolean` og sendes alltid, med `true` eller `false`.
  - `annen-fravarsgrunn` er `valueCoding` med kode og visningstekst fra svaralternativene i
    Questionnaire-definisjonen, og utelates når sykmeldingen ikke har en annen lovfestet
    fraværsgrunn.
  - `yrkesskade` er en gruppe med boolean og valgfri skadedato (`yrkesskade-skadedato` utelates hvis
    ikke relevant).
  - `arbeidsforhold` er en gruppe med arbeidsgivernavn.
