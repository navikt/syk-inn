# DocumentReference

Navs behov: **Lese**, **Skrive**

_Relevante referanser:_

- [no-basis-DocumentReference](https://simplifier.net/hl7norwayno-basis/nobasisdocumentreference) (simplifier)
- [DocumentReference](https://www.hl7.org/fhir/R4/documentreference.html) (HL7)
- [no-basis-DocumentReferenceType](https://simplifier.net/hl7norwayno-basis/no-basis-documentreference-type) (simplifier)
- [Kodesystem for Dokumenttyper](https://finnkode.helsedirektoratet.no/adm/collections/9602?q=9602)(Finnkode - Helsedirektoratet)

## Eksempel JSON-struktur for _no-basis-DocumentReference_

Her er feltene:

- `status`

I eksempelet fordi den er påkrevd i R4 FHIR spesifikasjonen, men det er ikke et felt som Nav bruker i dag.

```json
{
    "resourceType": "DocumentReference",
    "description": "Generell forklaring av dokumentet",
    "id": "unik DocumentReference id",
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
    "subject": { "reference": "Patient/<Pasient ID dokumentet gjelder for>" },
    "author": [{ "reference": "Practitioner/<Behandler ID som autoriserte dokumentet>" }],
    "context": {
        "encounter": [
            { "reference": "Encounter/<Referanse til encounter fordi Nav loven krever konsultasjon for sykmelding>" }
        ]
    },
    "status": "current"
}
```

## Begrunnelse

_Context.Encounter_ MÅ inneholde referanse til konsultasjon da Lov om folketrygd (folketrygdloven) §8-7 krever konsultasjon for sykmelding.

## Notater

Enda uavklart om Nav skal bestemme tittelen på dokumentet, eller om dette er opp til EPJ-en.
