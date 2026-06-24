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

## Begrunnelse

- `id` settes til sykmeldings-id-en, den samme id-en som benyttes for
  [DocumentReference](document-reference.md). Siden FHIR-identiteten er `<ressurstype>/<id>`, kan de
  to ressursene dele samme id-verdi, og DocumentReference kan referere til QuestionnaireResponse via
  `context.related` (se [Bundle](bundle.md)).
- `questionnaire` refererer til den offentlig publiserte Questionnaire-definisjonen via kanonisk URL.
  EPJ kan slå opp definisjonen for å forstå strukturen.
- `status` er satt til `completed` fordi sykmeldingen er ferdig utfylt.
- `subject` er en referanse til pasienten sykmeldingen gjelder for.
- `encounter` knytter svaret til den aktive konsultasjonen.
- `author` er en referanse til sykmelder som fylte ut sykmeldingen, og `authored` er tidspunktet.
- `item` inneholder alle strukturerte sykmeldingsdata. Verdier representeres med `valueCoding`,
  `valueDate`, `valueInteger`, `valueBoolean` eller `valueString` avhengig av felt.
  - `hoveddiagnose` og `bidiagnose` er `valueCoding` med kodesystem (ICD-10
    `urn:oid:2.16.578.1.12.4.1.1.7110` eller ICPC-2 `urn:oid:2.16.578.1.12.4.1.1.7170`), kode og
    visningstekst. Ingen egen Condition-ressurs benyttes. `bidiagnose` kan gjentas for flere
    bidiagnoser.
  - `aktivitet` er en gruppe med periode (`aktivitet-fom`/`aktivitet-tom`) og type. Flere perioder
    representeres ved å gjenta `aktivitet`-gruppen. `aktivitet-grad` inkluderes kun for type
    `GRADERT`.
  - `svangerskapsrelatert` er `valueBoolean`.
  - `yrkesskade` er en gruppe med boolean og valgfri skadedato (`yrkesskade-skadedato` utelates hvis
    ikke relevant).
  - `arbeidsforhold` er en gruppe med arbeidsgivernavn.
