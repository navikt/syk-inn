### Pasient

Vårt behov: **Lese**

> **JSON-struktur for _Patient:_**

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

> **Begrunnelse**
>
> > Vi trenger fødselsnummer eller d-nummer for å kunne identifisere pasienten. Navnet er mest for brukervennlighet og
> > for å kunne bekrefte at vi har riktig pasient.
> > **Notater** >> _Extension.Citizenship_ - Kreves av no-basis-Patient, men ikke av Nav. Hvis vi sløyfer dette kan det
> > være at EPJ også gjør det som da bryter med standarden. Risiko?
