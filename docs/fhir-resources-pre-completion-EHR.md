# FHIR ressurser for preutfylling fra EPJ

## Kontekst
Nav skal utvikle en SMART on FHIR applikasjon for ny sykmelding.
Under er ein beskrivelse av hvilke FHIR ressurser Nav trenger for preutfylling av sykmelding. 


### Preutfylling
For preutfylling fra EPJ til Nav forventes det at følgende FHIR ressurser er tilgjengelige i EPJ (SMART on FHIR) eller overføres til web-applikasjonen:
 - Pasient ([no-basis-Patient](https://simplifier.net/hl7norwayno-basis/nobasispatient]))
 - Helsepersonell ([no-basis-Practitioner](https://simplifier.net/hl7norwayno-basis/nobasispractitioner))
 - Helsepersonell rolle ([no-basis-PracitionerRole](https://simplifier.net/hl7norwayno-basis/nobasispractitionerrole))
 - Organisasjon ([no-basis-Organization](https://simplifier.net/hl7norwayno-basis/nobasisorganization))
 - Konsultasjon ([Encounter](https://www.hl7.org/fhir/encounter.html))
 - Diagnose ([Condition](https://simplifier.net/packages/hl7.fhir.r4.examples/4.0.1/files/98752))

---

## FHIR ressurstyper
### Pasient
> **JSON-struktur for *Patient:***
```json 
{
  "resourceType": "Patient",
  "meta": {
    "profile": [
      "http://hl7.no/fhir/StructureDefinition/no-basis-Patient"
    ]
  },
  "id": "unik Patient ident",
  "identifier": [
    {
      "system": "2.16.578.1.12.4.1.4.1",
      "value": "fødselsnummer"
    },
    {
      "system": "2.16.578.1.12.4.1.4.2",
      "value": "d-nummer"
    }
  ],
  "name": [
    {
      "family": "Etternavn",
      "given": [
        "Fornavn"
      ]
    }
  ]
}
```
> **Begrunnelse**
>> Vi trenger fødselsnummer eller d-nummer for å kunne identifisere pasienten. Navnet er mest for brukervennlighet og for å kunne bekrefte at vi har riktig pasient.
> **Notater**
>> *Extension.Citizenship* - Kreves av no-basis-Patient, men ikke av Nav. Hvis vi sløyfer dette kan det være at EPJ også gjør det som da bryter med standarden. Risiko? 

---

### Practitioner
> **Struktur for *Practitioner:***
```json
{
  "resourceType": "Practitioner",
  "meta": {
    "profile":  [
      "http://hl7.no/fhir/StructureDefinition/no-basis-Practitioner"
    ]
  },
  "identifier":  [
    {
      "system": "urn:oid:2.16.578.1.12.4.1.4.4",
      "value": "hpr-nummer"
    },
    {
      "system": "urn:oid:2.16.578.1.12.4.1.2",
      "value": "her-id"
    }
  ],
  "name":  [
    {
      "family": "Koman",
      "given":  [
        "Magnar"
      ]
    }
  ],
  "telecom":  [
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
>> Identifier - Vi må vite HER-id for å skille på kontor og behandler sykmeldingen kom fra


---

### Encounter
> **JSON-struktur for *Encounter:***
```json
{
  "resourceType": "Encounter",
  "id": "unik encounter ident",
  "class": {
    "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
    "code": "AMB | VR"
  },
  "subject": {
    "reference": "Pasienten dokumentet gjelder for"
  },
  "participant": [
    {
      "individual": {
        "reference": "Lege som autoriserte dokumentet"
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
>> Diagnosis.Condition.Type og Referanse - I følge R4 FHIR spec gjør rom for at man kan ha en referanse (literal reference) eller selve objektet (logical reference). Literal reference er da FHIR referansen til Condition, f.eks. Condition/unik-uuid-1234. [Dersom begge er til stede foretrekkes literal reference](https://www.hl7.org/fhir/R4/references.html#logical).
    Vi kan dog ikke forvente at en EPJ har registrert alle diagnosekoder som en Condition i sitt FHIR API.

> **Notater** 
>> ServiceProvider - er det nødvendig å vite hvilken organisasjon sykmeldingen kom fra?
    Class - denne bør være type behandling (fysisk eller virtuelt) etter norsk kodeverk. For v3-ActCode kan vi ta i bruk AMB (pasienten er fysisk til stede) og VR (virtuelt)
    Diagnosis.Condition - bør vi kreve referanse til Condition (literal reference), eller kan vi også godta selve objektet (logical reference)

---

### Condition
> **JSON-struktur for *ICD-10 Condition:***
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

> **JSON-struktur for *ICPC-2 Condition:***
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
>> *Code.System* - må være av type urn:oid:2.16.578.1.12.4.1.1.7170 eller urn:oid:2.16.578.1.12.4.1.1.7110
>
>> *Code.Code* - må være en godkjent *ICD-10* eller *ICPC-2 kode*

[//]: # (> Notater)
