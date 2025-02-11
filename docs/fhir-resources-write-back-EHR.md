# FHIR ressurser for tilbakeskriving til EPJ

## Kontekst
Nav skal utvikle en SMART on FHIR applikasjon for ny sykmelding.
Under er ein beskrivelse av hvilke FHIR ressurser Nav trenger for tilbakeskriving for sykmelding. 


### tilbakeskriving
For tilbakeskriving fra Nav til EPJ forventes det at følgende FHIR ressurser er tilgjengelige i EPJ (SMART on FHIR) eller overføres til web-applikasjonen:
 - DocumentReference ([DocumentReference](https://www.hl7.org/fhir/documentreference.html]))
---

## FHIR ressurstyper
### DocumentReference
> **JSON-struktur for *DocumentReference:***
```json
{
  "resourceType": "DocumentReference",
  "status": "current",
  "type": {
    "coding": [
      {
        "system": "urn:oid:2.16.578.1.12.4.1.1.9602",
        "code": "J01-2",
        "display": "Sykmeldinger og trygdesaker"
      }
    ]
  },
  "subject": {
    "reference": "Pasienten dokumentet gjelder for"
  },
  "author": [
    {
      "reference": "Lege som autoriserte dokumentet"
    }
  ],
  "description": "Generell forklaring av dokumentet",
  "content": [
    {
      "attachment": {
        "title": "Tittel generert av Nav",
        "language": "NO-nb",
        "contentType": "application/pdf",
        "data": "base64 PDF"
      }
    }
  ],
  "context": [
    {
      "encounter": "Referanse til encounter fordi Nav loven krever konsultasjon for sykmelding"
    }
  ]
}
```
>**Begrunnelse**
>> *Context.Encounter* MÅ inneholde referanse til konsultasjon da Lov om folketrygd (folketrygdloven) §8-7 krever konsultasjon for sykmelding.

> **Notater** 
>> *Custodian.Identifier* krever at EPJ har forhåndslagret Nav som organisasjon i sitt FHIR API. Nav er da lagret med organisasjonsnummer som identifier. Skal dette inkluderes?
>
> ```json 
> {
> "custodian": [{
>     "identifier": "Referanse til Nav organization i EPJ FHIR API. Eks: api.no/fhir/Organization?identifier=889640782"
>     }]
> }
> ```
>> *Content.Attachment.Title* - hva skal tittelen inneholde?
  fom og tom? noe slikt: sykmelding 01.01.2019 - 01.02.2019
 