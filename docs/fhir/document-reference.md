### DocumentReference

Vårt behov: **Lese**, **Skrive**

> **JSON-struktur for _DocumentReference:_**

```json
{
    "resourceType": "DocumentReference",
    "status": "current",
    "category": [
        {
            "coding": [
                {
                    "system": "urn:oid:2.16.578.1.12.4.1.1.9602",
                    "code": "J01-2",
                    "display": "Sykmeldinger og trygdesaker"
                }
            ]
        }
    ],
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
    "context": {
        "encounter": [{ "reference": "Referanse til encounter fordi Nav loven krever konsultasjon for sykmelding" }]
    }
}
```

> **Begrunnelse**
>
> > _Context.Encounter_ MÅ inneholde referanse til konsultasjon da Lov om folketrygd (folketrygdloven) §8-7 krever konsultasjon for sykmelding.

> **Notater**
>
> > _Custodian.Identifier_ krever at EPJ har forhåndslagret Nav som organisasjon i sitt FHIR API. Nav er da lagret med organisasjonsnummer som identifier. Skal dette inkluderes?
>
> ```json
> {
>     "custodian": [
>         {
>             "identifier": "Referanse til Nav organization i EPJ FHIR API. Eks: api.no/fhir/Organization?identifier=889640782"
>         }
>     ]
> }
> ```
>
> > _Content.Attachment.Title_ - hva skal tittelen inneholde?
> > fom og tom? noe slikt: sykmelding 01.01.2019 - 01.02.2019
