# DocumentReference

Navs behov: **Lese**, **Skrive**

_Relevante referanser:_

- [no-basis-DocumentReference](https://simplifier.net/hl7norwayno-basis/nobasisdocumentreference) (
  Simplifier)
- [no-basis-DocumentReferenceType](https://simplifier.net/hl7norwayno-basis/no-basis-documentreference-type) (
  Simplifier)
- [DocumentReference](https://www.hl7.org/fhir/R4/documentreference.html) (HL7)
- [Kodesystem for Dokumenttyper](https://finnkode.helsedirektoratet.no/adm/collections/9602?q=9602)(
  Finnkode - Helsedirektoratet)

## Eksempel JSON-struktur for _no-basis-DocumentReference_

Her er feltet `status` i eksempelet fordi den er påkrevd i R4 FHIR spesifikasjonen, men det er ikke
et felt som Nav bruker i dag.

```json
{
    "resourceType": "DocumentReference",
    "id": "unik DocumentReference id",
    "description": "Menneskelig lesbar forklaring av dokumentet",
    "type": {
        "coding": [
            {
                "system": "urn:oid:2.16.578.1.12.4.1.1.9602",
                "code": "J01-2",
                "display": "Sykmeldinger og trygdesaker"
            }
        ]
    },
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
    "subject": {
        "reference": "Patient/<Pasient ID dokumentet gjelder for>"
    },
    "author": [
        {
            "reference": "Practitioner/<Behandler ID som autoriserte dokumentet>"
        }
    ],
    "context": {
        "encounter": [
            {
                "reference": "Encounter/<Referanse til encounter fordi Nav loven krever konsultasjon for sykmelding>"
            }
        ]
    },
    "status": "current"
}
```

## Begrunnelse

- `Type` benyttes til å spesifisere dokumenttype. Dette bruker
  kodeverket [9602, Dokumenttyper](https://finnkode.helsedirektoratet.no/adm/collections/9602?q=9602)
  fra
  Helsedirektoratet. For sykmelding vil alle dokumenter være kode J01-2.
- `Description` er en overordnet beskrivelse av dokumentet, for sykmeldingen vil vi generere opp en
  informativ beskrivelse
  som _"100% Sykmelding fra 01.06.2024 til 07.06.2024"_.
- `Content` er selve dokumentet, for sykmeldinger så vil vi opprette PDF-er med base64-koding som
  vist
  i eksempelet over.
- `Subject` er en refereanse til pasienten som gjelder for den aktuelle sykmeldingen.
- `Author` er en referanse til Practitioner som sendte inn sykmeldingen.
- `Context` → `Encounter` er brukt til å ivareta kravet om at en sykmelding krever en konsultasjon.
  Sykmeldingsapplikasjonen
  vil ivare ta at sykmeldinger kun sendes i rett type konsultasjon. Se [Encounter](encounter.md) for
  flere detaljer.

`Context.Encounter` **MÅ** inneholde referanse til konsultasjon da Folketrygdloven §8-7 krever
konsultasjon for sykmelding.

## Avklaringer

- [ ] Skal Nav eller EPJ bestemme tittel på dokumentet.
