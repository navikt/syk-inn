# Encounter

Vårt behov: **Lese**

_Relevante referanser:_

- [Encounter](https://www.hl7.org/fhir/R4/encounter.html) (HL7)

## Eksempel JSON-struktur for Encounter

Her er feltene:

- `status`
- `class`

I eksempelet fordi den er påkrevd i R4 FHIR spesifikasjonen, men det er ikke et felt som Nav bruker i dag.

```json
{
    "resourceType": "Encounter",
    "id": "unik encounter ident",
    "subject": {
        "reference": "Patient/<Pasienten encounter gjelder for>"
    },
    "participant": [
        {
            "individual": {
                "reference": "Practitioner/<Lege som startet encounteret>"
            }
        }
    ],
    "diagnosis": [
        {
            "condition": {
                "reference": "Condition/<Referanse til Condition i FHIR API>"
            }
        }
    ],
    "serviceProvider": {
        "reference": "Organization/<Helseforetaket som utfører konsultasjonen>"
    },
    "status": "in-progress",
    "class": {
        "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
        "code": "AMB | VR"
    }
}
```

## Begrunnelse

Diagnosis.Condition.Type og Referanse - I følge R4 FHIR spec gjør rom for at man kan ha en referanse (literal reference) eller selve objektet (logical reference). Literal reference er da FHIR referansen til Condition, f.eks. Condition/unik-uuid-1234. [Dersom begge er til stede foretrekkes literal reference](https://www.hl7.org/fhir/R4/references.html#logical).

### Notater

Class - denne bør være type behandling (fysisk eller virtuelt) etter norsk kodeverk. For v3-ActCode kan vi ta i bruk AMB (pasienten er fysisk til stede) og VR (virtuelt)
Diagnosis.Condition - bør vi kreve referanse til Condition (literal reference), eller kan vi også godta selve objektet (logical reference)
