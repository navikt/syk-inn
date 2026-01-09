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

Condition benyttes for å preutfylle diagnose i appen, er ikke påkrevd

- _coding.system_ - må være av type:
    - ICD10: `urn:oid:2.16.578.1.12.4.1.1.7170`
    - ICPC2: `urn:oid:2.16.578.1.12.4.1.1.7110`
    - ICPC2B `urn:oid:2.16.578.1.12.4.1.1.7171`
- _coding.code_ - må være en godkjent _ICD-10_, _ICPC-2 kode_ eller _ICPC-2B kode_
- _coding.display_ - tekst som beskriver diagnosen, brukes til visning for helsepersonell
