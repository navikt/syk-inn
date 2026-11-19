# Condition

Vårt behov: **Lese**

_Relevante referanser:_

- [Condition](https://www.hl7.org/fhir/R4/condition.html) (HL7)
- [ICPC-2](https://www.helsedirektoratet.no/digitalisering-og-e-helse/helsefaglige-kodeverk/icpc)
  (Helsedirektoratet)
- [ICD-10](https://www.helsedirektoratet.no/digitalisering-og-e-helse/helsefaglige-kodeverk/icd)
  (Helsedirektoratet)

## Eksempel JSON-struktur for _ICPC-2 Condition_

```json
{
  "resourceType": "Condition",
  "id": "unik Condition ident",
  "subject": {
    "reference": "Patient/<Pasienten Condition gjelder for>"
  },
  "code": {
    "coding": [
      {
        "system": "urn:oid:2.16.578.1.12.4.1.1.7170",
        "display": "Diagnosetekst",
        "code": "ICPC-2 diagnosekode"
      }
    ]
  },
  "encounter": {
    "reference": "Encounter/<konsultasjon diagnosen ble satt>"
  }
}
```

## Eksempel JSON-struktur for _ICD-10 Condition_

```json
{
  "resourceType": "Condition",
  "id": "unik Condition ident",
  "subject": {
    "reference": "Patient/<Pasienten Condition gjelder for>"
  },
  "code": {
    "coding": [
      {
        "system": "urn:oid:2.16.578.1.12.4.1.1.7110",
        "display": "Diagnosetekst",
        "code": "ICD-10 diagnosekode"
      }
    ]
  },
  "encounter": {
    "reference": "Encounter/<konsultasjon diagnosen ble satt>"
  }
}
```

## Krav

Se [oversikten](_oversikt.md#hvordan-kravene-leses) for forklaring av kildene. HL7 Norge har ingen
no-basis-profil for Condition. Condition er ikke påkrevd: uten den preutfylles ingen diagnoser.

- **Nav:** EPJ støtter søket `Condition?encounter=<encounter-id>` (søkeparameteren `encounter` i R4)
  og svarer med en Bundle av typen `searchset`. Diagnosene hentes ikke fra `Encounter.diagnosis`.
- **R4:** `subject` (1..1).
- **Nav:** `code.coding` med kodesystem ICD-10, ICPC-2 eller ICPC-2B, og med `code` og `display`.
  Conditions uten et av disse kodesystemene ignoreres.

### Dagens begrensninger

- Alle `coding`-elementer i alle Conditions i søkeresultatet må ha `system`, `code` og `display`. I
  R4 er alle tre 0..1. Ett element uten `display`, for eksempel en ekstra SNOMED-kode, avviser hele
  søkeresultatet slik at ingen diagnoser preutfylles. Se
  [navikt/smart-on-fhir#104](https://github.com/navikt/smart-on-fhir/issues/104).
- Hver Condition må ha `encounter.reference` og `code.coding`. I R4 er `encounter` og `code` 0..1.

## Begrunnelse

Condition benyttes for å preutfylle diagnose i appen, er ikke påkrevd

- _coding.system_ - må være av type:
  - ICD10: `urn:oid:2.16.578.1.12.4.1.1.7110`
  - ICPC2: `urn:oid:2.16.578.1.12.4.1.1.7170`
  - ICPC2B `urn:oid:2.16.578.1.12.4.1.1.7171`
- _coding.code_ - må være en godkjent _ICD-10_, _ICPC-2 kode_ eller _ICPC-2B kode_
- _coding.display_ - tekst som beskriver diagnosen, brukes til visning for helsepersonell
