# Practitioner

Navs behov: **Lese**

_Relevante referanser:_

- [no-basis-Practitioner](https://simplifier.net/hl7norwayno-basis/nobasispractitioner) (simplifier)
- [no-basis-HumanName](https://simplifier.net/hl7norwayno-basis/nobasishumanname) (simplifier)
- [Practitioner](https://www.hl7.org/fhir/R4/practitioner.html) (HL7)

## Eksempel JSON-struktur for _no-basis-Practitioner_

```json
{
  "resourceType": "Practitioner",
  "id": "unik Practitioner id",
  "meta": {
    "profile": ["http://hl7.no/fhir/StructureDefinition/no-basis-Practitioner"]
  },
  "identifier": [
    {
      "system": "urn:oid:2.16.578.1.12.4.1.4.4",
      "value": "hpr-nummer"
    }
  ],
  "name": [
    {
      "family": "Etternavn",
      "given": ["Fornavn"]
    }
  ]
}
```

## Krav

Practitioner leses fra `fhirUser`, se [Launch-kontekst](_oversikt.md#launch-kontekst).

| Felt                        | R4          | Nav     | Merknad                                                                   |
| --------------------------- | ----------- | ------- | ------------------------------------------------------------------------- |
| `identifier` (HPR-nummer)   | 0..\*       | Påkrevd |                                                                           |
| `name`                      | 0..\*       | Påkrevd | Første element brukes.                                                    |
| `name.family`, `name.given` | 0..1, 0..\* | Påkrevd | Gjelder alle `name`-elementer. Navn med kun `text` avvises ([#104][lib]). |

[lib]: https://github.com/navikt/smart-on-fhir/issues/104

## Begrunnelse

- Identifier/hpr-nummer benyttes som identifikator for sykmelder/helsepersonell.
- Name benyttes som sykmelders navn.
- Qualifications feltet er fjernet da dette hentes fra HelseID
