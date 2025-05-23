### Encounter

Vårt behov: **Lese**

> **JSON-struktur for _Encounter:_**

```json
{
    "resourceType": "Encounter",
    "id": "unik encounter ident",
    "status": "in-progress",
    "class": {
        "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
        "code": "AMB | VR"
    },
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
    "period": {
        "start": "dato og tid konsultasjonen startet"
    },
    "diagnosis": [
        {
            "condition": {
                "type": "Condition",
                "reference": "Referanse til Condition i FHIR API"
            }
        }
    ]
}
```

> **Begrunnelse**
>
> > Diagnosis.Condition.Type og Referanse - I følge R4 FHIR spec gjør rom for at man kan ha en referanse (literal reference) eller selve objektet (logical reference). Literal reference er da FHIR referansen til Condition, f.eks. Condition/unik-uuid-1234. [Dersom begge er til stede foretrekkes literal reference](https://www.hl7.org/fhir/R4/references.html#logical).

    Vi kan dog ikke forvente at en EPJ har registrert alle diagnosekoder som en Condition i sitt FHIR API.

> **Notater**
>
> > ServiceProvider - er det nødvendig å vite hvilken organisasjon sykmeldingen kom fra?

    Class - denne bør være type behandling (fysisk eller virtuelt) etter norsk kodeverk. For v3-ActCode kan vi ta i bruk AMB (pasienten er fysisk til stede) og VR (virtuelt)
    Diagnosis.Condition - bør vi kreve referanse til Condition (literal reference), eller kan vi også godta selve objektet (logical reference)
