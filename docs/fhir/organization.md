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

Organization leses fra `Encounter.serviceProvider`.

| Felt                               | R4    | Nav     | Merknad                      |
| ---------------------------------- | ----- | ------- | ---------------------------- |
| `identifier` (organisasjonsnummer) | 0..\* | Påkrevd |                              |
| `telecom` (`system` `phone`)       | 0..\* | Påkrevd | Første telefonnummer brukes. |
| `identifier.system`, `.value`      | 0..1  | Påkrevd | Gjelder alle elementer.      |
| `telecom.system`, `.value`         | 0..1  | Påkrevd | Gjelder alle elementer.      |

## Begrunnelse

- Identifier/organisasjonsnummer - Nav benytter organisasjonsnummer som identifikator for
  organisasjonen sykmelder er tilknyttet (f.eks. fastlegekontor).
- Telecom/phone - Saksbehandlere og veiledere i Nav trenger telefonnummer for å kontakte sykmelder
  ved oppfølging av sykmelding.

## Planlagt

- Identifier/her-id skal brukes til å sende dokumenter asynkront (som Dialogmelding) til EPJ hvis
  synkron tilbakeskriving feiler.
