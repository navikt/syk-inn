# Practitioner

Navs behov: **Lese**

_Relevante referanser:_

- [no-basis-Practitioner](https://simplifier.net/hl7norwayno-basis/nobasispractitioner) (simplifier)
- [no-basis-HumanName](https://simplifier.net/hl7norwayno-basis/nobasishumanname) (simplifier)
- [Practitioner](https://www.hl7.org/fhir/R4/practitioner.html) (HL7)

## Eksempel JSON-struktur for _no-basis-Practitioner_

```json
{
  "resourceType": "Practitioner",
  "id": "unik Practitioner id",
  "meta": {
    "profile": ["http://hl7.no/fhir/StructureDefinition/no-basis-Practitioner"]
  },
  "identifier": [
    {
      "system": "urn:oid:2.16.578.1.12.4.1.4.4",
      "value": "hpr-nummer"
    }
  ],
  "name": [
    {
      "family": "Etternavn",
      "given": ["Fornavn"]
    }
  ]
}
```

## Krav

Se [oversikten](_oversikt.md#hvordan-kravene-leses) for forklaring av kildene.

- **Nav:** `identifier` med HPR-nummer (`urn:oid:2.16.578.1.12.4.1.4.4`). R4 og no-basis krever ikke
  `identifier`, men et HPR-element må ha `system` og `value` i no-basis.
- **Nav:** `name`. R4 og no-basis krever ikke `name`. Uten `name` feiler syk-inn for alle kall,
  fordi Practitioner leses i hver forespørsel.
- **Nav:** `fhirUser`-claimet i id_token peker på Practitioner som leses. Id-en brukes også som
  `author` i tilbakeskrivingen.

### Dagens begrensninger

- `fhirUser` må være en relativ referanse på formen `Practitioner/<id>`. SMART App Launch STU 2.2
  tillater også absolutte URL-er, men biblioteket forventer relativ form, se
  [Launch-kontekst](_oversikt.md#launch-kontekst).
- Alle `name`-elementer må ha både `family` og `given`, og første `given` i det første elementet
  brukes som fornavn. I R4 og no-basis er `family` 0..1 og `given` 0..\*. Se
  [navikt/smart-on-fhir#104](https://github.com/navikt/smart-on-fhir/issues/104).

## Begrunnelse

- Identifier/hpr-nummer benyttes som identifikator for sykmelder/helsepersonell.
- Name benyttes som sykmelders navn.
- Qualifications feltet er fjernet da dette hentes fra HelseID
