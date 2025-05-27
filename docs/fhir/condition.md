# Condition

Vårt behov: **Lese**

_Relevante referanser:_

- [Condition](https://www.hl7.org/fhir/R4/condition.html) (HL7)
- [ICPC-2](https://www.helsedirektoratet.no/digitalisering-og-e-helse/helsefaglige-kodeverk/icpc) (Helsedirektoratet)
- [ICD-10](https://www.helsedirektoratet.no/digitalisering-og-e-helse/helsefaglige-kodeverk/icd) (Helsedirektoratet)

## Eksempel JSON-struktur for _ICPC-2 Condition_

```json
{
    "resourceType": "Condition",
    "id": "unik Condition ident",
    "subject": {
        "reference": "Patient/<Pasienten Condition gjelder for>"
    },
    "code": {
        "coding": [
            {
                "system": "urn:oid:2.16.578.1.12.4.1.1.7170",
                "display": "Diagnosetekst",
                "code": "ICPC-2 diagnosekode"
            }
        ]
    }
}
```

## Eksempel JSON-struktur for _ICD-10 Condition_

```json
{
    "resourceType": "Condition",
    "id": "unik Condition ident",
    "subject": {
        "reference": "Patient/<Pasienten Condition gjelder for>"
    },
    "code": {
        "coding": [
            {
                "system": "urn:oid:2.16.578.1.12.4.1.1.7110",
                "display": "Diagnosetekst",
                "code": "ICD-10 diagnosekode"
            }
        ]
    }
}
```

## Begrunnelse

_coding.system_ - må være av type urn:oid:2.16.578.1.12.4.1.1.7170 eller urn:oid:2.16.578.1.12.4.1.1.7110

_coding.code_ - må være en godkjent _ICD-10_ eller _ICPC-2 kode_

_coding.display_ - tekst som beskriver diagnosen, brukes til visning for helsepersonell
