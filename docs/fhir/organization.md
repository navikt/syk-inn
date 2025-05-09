### Organization

Vårt behov: **Lese**

> **Struktur for _Organization:_**

```json
{
    "resourceType": "Organization",
    "id": "unik Organization id",
    "identifier": [
        {
            "system": "urn:oid:2.16.578.1.12.4.1.4.101",
            "value": "org-nummer / ENH"
        },
        {
            "system": "urn:oid:2.16.578.1.12.4.1.4.102",
            "value": "RESH ID / RSH"
        }
    ],
    "name": "Navn på organisasjon",
    "telecom": [
        {
            "system": "email",
            "value": "lege@epj.no"
        },
        {
            "system": "phone",
            "value": "12345678"
        }
    ]
}
```

> **Begrunnelse**
>
> > Vi trenger telecom fra organization dersom denne ikke er satt på Practitioner
