# Organization

Navs behov: **Lese**

_Relevante referanser:_

- [no-basis-Organization](https://simplifier.net/hl7norwayno-basis/nobasisorganization) (simplifier)
- [Organization](https://hl7.org/fhir/R4/organization.html) (HL7)

## Eksempel på JSON-struktur for _no-basis-Organization_

```json
{
  "resourceType": "Organization",
  "id": "unik Organization id",
  "meta": {
    "profile": ["http://hl7.no/fhir/StructureDefinition/no-basis-Organization"]
  },
  "identifier": [
    {
      "system": "urn:oid:2.16.578.1.12.4.1.4.101",
      "value": "organisasjonsnummer / ENH"
    }
  ],
  "telecom": [
    {
      "system": "phone",
      "value": "12345678"
    }
  ]
}
```

## Krav

Se [oversikten](_oversikt.md#hvordan-kravene-leses) for forklaring av kildene.

- **R4:** `identifier` eller `name` må være med (org-1). Nav-kravet under oppfyller dette.
- **Nav:** `identifier` med organisasjonsnummer (`urn:oid:2.16.578.1.12.4.1.4.101`). no-basis har en
  `ENH`-slice for dette, men krever ikke at den finnes.
- **Nav:** `telecom` med `system` satt til `phone`. R4 og no-basis krever ikke `telecom`.
- Organization leses med `Encounter.serviceProvider.reference`, se [Encounter](encounter.md).

### Dagens begrensninger

- `identifier` og `telecom` må finnes som lister i svaret (eventuelt tomme), og hvert element må ha
  `system` og `value`. R4 har `identifier` og `telecom` som 0..\*, og `system` og `value` som 0..1.
  Mangler listene, avvises hele Organization i stedet for at appen melder manglende orgnummer eller
  telefonnummer.
- Det første `telecom`-elementet med `system` `phone` brukes.

## Begrunnelse

- Identifier/organisasjonsnummer - Nav benytter organisasjonsnummer som identifikator for
  organisasjonen sykmelder er tilknyttet (f.eks. fastlegekontor).
- Telecom/phone - Saksbehandlere og veiledere i Nav trenger telefonnummer for å kontakte sykmelder
  ved oppfølging av sykmelding.

## Planlagt

- Identifier/her-id skal brukes til å sende dokumenter asynkront (som Dialogmelding) til EPJ hvis
  synkron tilbakeskriving feiler. Brukes ikke i dag, og er ikke påkrevd.
