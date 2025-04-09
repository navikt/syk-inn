### Practitioner

Vårt behov: **Lese**

> **Struktur for _Practitioner:_**

```json
{
    "resourceType": "Practitioner",
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
    ],
    "name": [
        {
            "family": "Koman",
            "given": ["Magnar"]
        }
    ],
    "telecom": [
        {
            "system": "phone",
            "value": "12345678",
            "use": "(work | mobile)"
        },
        {
            "system": "email",
            "value": "lege@epj.no",
            "use": "work"
        }
    ]
}
```

> **Begrunnelse**
>
> > Identifier - Vi må vite HER-id for å skille på kontor og behandler sykmeldingen kom fra
