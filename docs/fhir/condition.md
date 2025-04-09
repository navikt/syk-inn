### Condition

Vårt behov: **Lese**

> **JSON-struktur for _ICD-10 Condition:_**

```json
{
    "resourceType": "Condition",
    "id": "unik Condition ident",
    "subject": {
        "type": "Patient",
        "reference": "Pasienten Condition gjelder for"
    },
    "code": {
        "coding": [
            {
                "system": "urn:oid:2.16.578.1.12.4.1.1.7110",
                "display": "Diagnose",
                "code": "ICD-10 diagnosekode"
            }
        ]
    }
}
```

> **JSON-struktur for _ICPC-2 Condition:_**

```json
{
    "resourceType": "Condition",
    "id": "unik Condition ident",
    "subject": {
        "type": "Patient",
        "reference": "Pasienten Condition gjelder for"
    },
    "code": {
        "coding": [
            {
                "system": "urn:oid:2.16.578.1.12.4.1.1.7170",
                "display": "Diagnose",
                "code": "ICPC-2 diagnosekode"
            }
        ]
    }
}
```

> **Begrunnelse**
>
> > _Code.System_ - må være av type urn:oid:2.16.578.1.12.4.1.1.7170 eller urn:oid:2.16.578.1.12.4.1.1.7110
>
> > _Code.Code_ - må være en godkjent _ICD-10_ eller _ICPC-2 kode_
