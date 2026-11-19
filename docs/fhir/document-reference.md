# DocumentReference

Navs behov: **Lese**, **Skrive**

_Relevante referanser:_

- [no-basis-DocumentReference](https://simplifier.net/hl7norwayno-basis/nobasisdocumentreference) (
  Simplifier)
- [no-basis-DocumentReferenceType](https://simplifier.net/hl7norwayno-basis/no-basis-documentreference-type)
  ( Simplifier)
- [DocumentReference](https://www.hl7.org/fhir/R4/documentreference.html) (HL7)
- [Kodesystem for Dokumenttyper](https://finnkode.helsedirektoratet.no/adm/collections/9602?q=9602)(
  Finnkode - Helsedirektoratet)

## Eksempel JSON-struktur for _no-basis-DocumentReference_

Feltet `status` er med fordi det er påkrevd i R4 (1..1). `context.period` er valgfritt i R4, men
settes av syk-inn.

```json
{
  "meta": {
    "lastUpdated": "Last updated _timestamp_"
  },
  "resourceType": "DocumentReference",
  "id": "unik DocumentReference id",
  "description": "Menneskelig lesbar forklaring av dokumentet",
  "type": {
    "coding": [
      {
        "system": "urn:oid:2.16.578.1.12.4.1.1.9602",
        "code": "J01-2",
        "display": "Sykmeldinger og trygdesaker"
      }
    ]
  },
  "content": [
    {
      "attachment": {
        "title": "Tittel generert av Nav",
        "language": "NO-nb",
        "contentType": "application/pdf",
        "data": "base64 PDF"
      }
    }
  ],
  "subject": {
    "reference": "Patient/<Pasient ID dokumentet gjelder for>"
  },
  "author": [
    {
      "reference": "Practitioner/<Behandler ID som autoriserte dokumentet>"
    }
  ],
  "context": {
    "encounter": [
      {
        "reference": "Encounter/<Referanse til encounter fordi Nav loven krever konsultasjon for sykmelding>"
      }
    ],
    "period": {
      "start": "1970-01-01",
      "end": "1970-01-02"
    }
  },
  "status": "current"
}
```

## Krav

Se [oversikten](_oversikt.md#hvordan-kravene-leses) for forklaring av kildene.

- **R4:** `status` (1..1) og `content.attachment` (1..1). syk-inn sender `status` `current`.
- **no-basis:** `type` er bundet til ValueSet `no-basis-documentreference-type`. syk-inn sender
  J01-2 (Sykmeldinger og trygdesaker) fra kodeverk 9602.
- **Nav:** `subject`, `author` og `context.encounter` med referanser til Patient, Practitioner og
  Encounter fra launch-konteksten. R4 har `subject` 0..1, `author` 0..\* og `context` 0..1.
- **Nav:** `context.period` og `description`. Begge er 0..1 i R4.
- **Nav:** `content.attachment` med `contentType` `application/pdf`, `language` `NO-nb`, `title` og
  base64-kodet `data`.
- **Nav:** Skriving med `PUT DocumentReference/<id>`, der id er satt av syk-inn. Før skriving gjør
  syk-inn `GET DocumentReference/<id>` og forventer `404` hvis dokumentet ikke finnes. Finnes det
  allerede, skrives ikke noe på nytt.
- Utover `GET` på id-en før skriving leser syk-inn ikke DocumentReference.

### Dagens begrensninger

- Svaret på `GET` og `PUT` må være en vellykket respons med hele ressursen i body. R4 tillater at en
  server svarer uten body når `Prefer` ikke er satt, og syk-inn sender ikke `Prefer`. En tom body
  gir en `SyntaxError` fra `response.json()`. En body som ikke samsvarer med skjemaet gir
  `CREATE_FAILED_INVALID_RESPONSE` og syk-inn melder at dokumentet ikke ble opprettet.
- Svaret må ha `status`, `type.coding` (med `system`, `code` og `display`), `meta.lastUpdated`,
  `subject.reference`, `author[].reference`, `content[].attachment` og
  `context.encounter[].reference`. Av disse er bare `status` og `content.attachment` påkrevd i R4,
  og `meta.lastUpdated` er 0..1. `OperationOutcome` som svar avvises også, siden det ikke er en
  DocumentReference. Se
  [navikt/smart-on-fhir#104](https://github.com/navikt/smart-on-fhir/issues/104).
- Svar med `404`, `405` eller `501` på `PUT` tolkes som at EPJ ikke støtter skriving, og dokumentet
  regnes som ikke opprettet.
- Bare PDF sendes i dag.

## Begrunnelse

- `Type` benyttes til å spesifisere dokumenttype. Dette bruker kodeverket
  [9602, Dokumenttyper](https://finnkode.helsedirektoratet.no/adm/collections/9602?q=9602) fra
  Helsedirektoratet. For sykmelding vil alle dokumenter være kode J01-2.
- `Description` er en overordnet beskrivelse av dokumentet, for sykmeldingen vil vi generere opp en
  informativ beskrivelse som _"100% Sykmelding fra 01.06.2024 til 07.06.2024"_.
- `Content` er selve dokumentet, for sykmeldinger så vil vi opprette PDF-er med base64-koding som
  vist i eksempelet over.
- `Subject` er en refereanse til pasienten som gjelder for den aktuelle sykmeldingen.
- `Author` er en referanse til Practitioner som sendte inn sykmeldingen.
- `Context` → `Encounter` er brukt til å ivareta kravet om at en sykmelding krever en konsultasjon.
  Intensjonen er at sykmeldinger kun sendes i rett type konsultasjon, men syk-inn kontrollerer ikke
  dette i dag. Se [Encounter](encounter.md) for flere detaljer.

`Context.Encounter` **MÅ** inneholde referanse til konsultasjon da Folketrygdloven §8-7 krever
konsultasjon for sykmelding.

## Planlagt

- Base64-kodet FHIR JSON (`application/fhir+json`) som alternativ til PDF. Bibliotekets skjema
  støtter det, men syk-inn sender det ikke i dag.
- Å sende dokumentet som en del av en Bundle, se [Bundle](bundle.md).
