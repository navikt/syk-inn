# Bundle

Navs behov: **Skrive**

_Relevante referanser:_

- [Bundle](https://www.hl7.org/fhir/R4/bundle.html) (HL7)
- [QuestionnaireResponse](questionnaire-response.md)
- [DocumentReference](document-reference.md)
- [ADR01 - FHIR resources for writing data back to EHR](../adr/ADR01%20-%20FHIR%20resources%20for%20writing%20data%20back%20to%20EHR.md)

For tilbakeskriving av _FHIR-strukturerte_ data kan Nav sende en `batch`-Bundle. Bundlen inneholder
både [QuestionnaireResponse](questionnaire-response.md) (de strukturerte dataene) og
[DocumentReference](document-reference.md) (PDF-en). I en `batch` behandles hver `entry` uavhengig,
slik at DocumentReference alltid kan lagres selv om QuestionnaireResponse skulle feile (se
Begrunnelse under). Selve bundlen sendes med `POST` til FHIR-serverens base-URL (`/`), mens hver
`entry` i bundlen bruker `PUT` for å lagre den enkelte ressursen.

> **Merk:** Bundle er foreløpig ikke implementert. I dagens løsning skrives DocumentReference og
> QuestionnaireResponse som to separate `PUT`-kall, ett per ressurs. DocumentReference skrives
> alltid (journalføringsplikten), mens QuestionnaireResponse er en nice-to-have som skrives
> best-effort.

## Eksempel JSON-struktur for _batch Bundle_

`item`-feltene i QuestionnaireResponse er forkortet under. Se
[QuestionnaireResponse](questionnaire-response.md) for full struktur.

```json
{
  "resourceType": "Bundle",
  "type": "batch",
  "entry": [
    {
      "fullUrl": "QuestionnaireResponse/<sykmelding-id>",
      "resource": {
        "resourceType": "QuestionnaireResponse",
        "id": "<sykmelding-id>",
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
        "item": ["// se questionnaire-response.md for full item-struktur"]
      },
      "request": {
        "method": "PUT",
        "url": "QuestionnaireResponse/<sykmelding-id>"
      }
    },
    {
      "fullUrl": "DocumentReference/<sykmelding-id>",
      "resource": {
        "resourceType": "DocumentReference",
        "id": "<sykmelding-id>",
        "status": "current",
        "type": {
          "coding": [
            {
              "system": "urn:oid:2.16.578.1.12.4.1.1.9602",
              "code": "J01-2",
              "display": "Sykmeldinger og trygdesaker"
            }
          ],
          "text": "Sykmelding"
        },
        "subject": {
          "reference": "Patient/<Pasienten sykmeldingen gjelder for>"
        },
        "author": [
          {
            "reference": "Practitioner/<Sykmelder som sendte inn sykmeldingen>"
          }
        ],
        "content": [
          {
            "attachment": {
              "contentType": "application/pdf",
              "language": "NO-nb",
              "title": "Sykmelding",
              "data": "base64 PDF"
            }
          }
        ],
        "context": {
          "encounter": [
            {
              "reference": "Encounter/<Referanse til aktiv konsultasjon>"
            }
          ],
          "period": {
            "start": "2026-02-10",
            "end": "2026-04-14"
          },
          "related": [
            {
              "reference": "QuestionnaireResponse/<sykmelding-id>"
            }
          ]
        }
      },
      "request": {
        "method": "PUT",
        "url": "DocumentReference/<sykmelding-id>"
      }
    }
  ]
}
```

## Begrunnelse

- `type` er `batch`. I en `batch`-Bundle behandles hver `entry` uavhengig: noen kan lykkes mens
  andre feiler. Dette er bevisst. EPJ er pålagt å journalføre sykmeldingen (journalføringsplikten),
  så DocumentReference (PDF-en) **må** alltid lagres, mens QuestionnaireResponse (strukturerte data)
  er en nice-to-have. En atomisk `transaction`, der alt rulles tilbake hvis én ressurs feiler, ville
  risikert at den lovpålagte DocumentReference ikke ble lagret fordi QuestionnaireResponse feilet.
- Selve bundlen sendes med `POST` til base-URL-en (`/`), slik FHIR-spesifikasjonen krever for en
  `batch`- eller `transaction`-Bundle. Det er `request.method` på hver `entry` som avgjør hvordan
  den enkelte ressursen lagres, og der bruker vi `PUT`.
- Hver `entry` bruker `PUT` (ikke `POST`) fordi Nav setter ressurs-id-en selv til sykmeldings-id-en:
  - `PUT /<ressurstype>/<sykmelding-id>` er en «update as create» (upsert) der klienten bestemmer
    id-en. `POST /<ressurstype>` ville latt FHIR-serveren generere en tilfeldig id og opprette en ny
    ressurs ved hvert kall.
  - Det gjør operasjonen idempotent: å sende samme sykmelding på nytt treffer samme id og
    overskriver i stedet for å lage duplikater. Idempotenssjekken
    (`GET /<ressurstype>/<sykmelding-id>`) er kun mulig fordi id-en er forutsigbar.
  - Fordi id-en er kjent på forhånd, kan `DocumentReference.context.related` peke til
    `QuestionnaireResponse/<sykmelding-id>` allerede før ressursen er lagret.
- Både `QuestionnaireResponse.id` og `DocumentReference.id` settes til sykmeldings-id-en. Siden
  FHIR-identiteten er `<ressurstype>/<id>`, kan de to ressursene dele samme id-verdi.
- Se [QuestionnaireResponse](questionnaire-response.md) og
  [DocumentReference](document-reference.md) for detaljer om de enkelte ressursene.
