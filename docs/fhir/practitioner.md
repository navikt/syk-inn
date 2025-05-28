# Practitioner

Navs behov: **Lese**

_Relevante referanser:_

- [no-basis-Practitioner](https://simplifier.net/hl7norwayno-basis/nobasispractitioner) (simplifier)
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
        },
        {
            "system": "urn:oid:2.16.578.1.12.4.1.2",
            "value": "her-id"
        }
    ]
}
```

## Begrunnelse

Identifier - Vi bruker HPR-nummer som identifikator for helsepersonellet. HER-ID er påkrevd og brukes
til å sende dokumenter til riktig helsepersonell i EPJ-systemet.
