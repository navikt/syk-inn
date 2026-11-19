# Pasient

Navs behov: **Lese**

_Relevante referanser:_

- [no-basis-Patient](https://simplifier.net/HL7Norwayno-basis/NoBasisPatient/) (simplifier)
- [no-basis-HumanName](https://simplifier.net/hl7norwayno-basis/nobasishumanname) (simplifier)
- [Patient](https://hl7.org/fhir/R4/patient.html) (HL7)

## Eksempel JSON-struktur for _no-basis-Patient_

```json
{
  "resourceType": "Patient",
  "meta": {
    "profile": ["http://hl7.no/fhir/StructureDefinition/no-basis-Patient"]
  },
  "id": "unik Patient ident",
  "identifier": [
    {
      "system": "urn:oid:2.16.578.1.12.4.1.4.1",
      "value": "fødselsnummer"
    },
    {
      "system": "urn:oid:2.16.578.1.12.4.1.4.2",
      "value": "d-nummer"
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

- **Nav:** `identifier` med fødselsnummer (`urn:oid:2.16.578.1.12.4.1.4.1`) eller d-nummer
  (`urn:oid:2.16.578.1.12.4.1.4.2`). R4 og no-basis krever ikke `identifier`, men et fnr- eller
  dnr-element må ha `system` og `value` i no-basis. Fødselsnummer foretrekkes hvis begge finnes.
- **Nav:** `name`. R4 og no-basis krever ikke `name`. Det første `name`-elementet brukes.
- Pasientens id kommer fra SMART launch-konteksten (`patient`), og Patient leses med `Patient/<id>`.

### Dagens begrensninger

- Alle `name`-elementer må ha både `family` og `given`, og første `given` i det første elementet
  brukes som fornavn. I R4 og no-basis er `family` 0..1 og `given` 0..\*. Et navn med bare `text`,
  eller uten ett av feltene, gjør at hele Patient avvises. Se
  [navikt/smart-on-fhir#104](https://github.com/navikt/smart-on-fhir/issues/104).

## Begrunnelse

- Identifier/fødslesnummer eller d-nummer er nødvendig for å identifisere pasienten
- name vises i appen slik at behandler kan bekrefte at det skrives sykmelding for korrekt pasient.
