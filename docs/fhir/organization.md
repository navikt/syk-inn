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
        },
        {
            "system": "urn:oid:2.16.578.1.12.4.1.2",
            "value": "her-id"
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

## Begrunnelse
- Identifier/organisasjonsnummer - Nav benytter organisasjonsnummer som identifikator for organisasjonen sykmelder er tilknyttet (f.eks. fastlegekontor).
- Identifier/her-id brukes til å sende dokumenter asynkront (som Dialogmelding) til EPJ hvis synkron tilbakeskriving feiler.
- Telecom/phone - Saksbehandlere og veiledere i Nav trenger telefonnummer for å kontakte sykmelder ved oppfølging av sykmelding.
