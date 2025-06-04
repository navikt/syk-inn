# Pasient

Navs behov: **Lese**

_Relevante referanser:_

- [no-basis-Patient](https://simplifier.net/HL7Norwayno-basis/NoBasisPatient/) (simplifier)
- [no-basis-HumanName](https://simplifier.net/hl7norwayno-basis/nobasishumanname) (simplifier)
- [Patient](https://hl7.org/fhir/R4/patient.html) (HL7)

## Eksempel JSON-struktur for _no-basis-Patient_

```json
{
    "resourceType": "Patient",
    "meta": {
        "profile": ["http://hl7.no/fhir/StructureDefinition/no-basis-Patient"]
    },
    "id": "unik Patient ident",
    "identifier": [
        {
            "system": "urn:oid:2.16.578.1.12.4.1.4.1",
            "value": "fødselsnummer"
        },
        {
            "system": "urn:oid:2.16.578.1.12.4.1.4.2",
            "value": "d-nummer"
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

## Begrunnelse
- Identifier/fødslesnummer eller d-nummer er nødvendig for å identifisere pasienten
- name vises i appen slik at behandler kan bekrefte at det skrives sykmelding for korrekt pasient.
