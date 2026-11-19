# FHIR ressurser for _preutfylling_ fra EPJ

Nav har utviklet en SMART on FHIR applikasjon for ny sykmelding.

## Hvordan kravene leses

Ressursdokumentene beskriver kun harde krav i kravtabellene: det som får syk-inn til å avvise
ressursen eller feile. Kontekstfelter som ikke er harde krav står i eksemplene og i begrunnelsen.

Kravene kommer fra tre kilder, i prioritert rekkefølge:

1. **FHIR R4**: HL7s basisspesifikasjon. Kardinalitetene i dokumentene er hentet derfra.
2. **no-basis**: profilene til HL7 Norge (pakken `hl7.fhir.no.basis`, kontrollert mot 2.0.15 og
   2.2.2). Det finnes ingen no-basis-profil for Encounter og Condition.
3. **Nav**: krav som syk-inn stiller i tillegg. Et Nav-krav kan stramme inn et felt som er valgfritt
   i R4 eller no-basis, men kan ikke overstyre dem.

To andre kategorier er merket for seg i hvert dokument:

- **Dagens begrensninger** er krav som følger av implementasjonen og ikke av R4 eller et reelt
  Nav-behov. De kan forsvinne når implementasjonen endres. Flere av dem skyldes strenge zod-skjemaer
  i `@navikt/smart-on-fhir`, se
  [navikt/smart-on-fhir#104](https://github.com/navikt/smart-on-fhir/issues/104).
- **Planlagt** er felter og ressurser som ikke brukes i dag, men som er beholdt for fremtidig bruk.

## Launch-kontekst

Pasient og konsultasjon identifiseres fra SMART launch-konteksten, ikke fra feltene i ressursene:

- Token-responsen må inneholde `patient` og `encounter`. Begge må være gyldige FHIR-id-er (1-64 tegn
  av `A-Za-z0-9-.`).
- `fhirUser`-claimet i id_token må peke på en Practitioner. Dette er et Nav-krav.

### Dagens begrensninger

- `fhirUser` må være en relativ referanse på formen `Practitioner/<id>`. SMART App Launch STU 2.2
  tillater også absolutte URL-er, men biblioteket henter id-en med `split('/')[1]` og forventer
  prefikset `Practitioner/`.

## Kontekst

Under er en beskrivelse av hvilke FHIR ressurser Nav trenger for preutfylling av sykmelding.

### Forhåndsutfylling

For forhåndsutfylling fra EPJ til Nav må følgende FHIR ressurser være tilgjengelige i EPJ FHIR
server:

- [Patient](./patient.md)
- [Practitioner](./practitioner.md)
- [Encounter](./encounter.md)
- [Organization](./organization.md)

Følgende ressurs bør være tilgjengelig, men er ikke påkrevd:

- [Condition](./condition.md)

# FHIR ressurser for _tilbakeskriving_ til EPJ

## Kontekst

Under er en beskrivelse av hvilke FHIR ressurser Nav trenger for tilbakeskriving av sykmelding til
EPJ.

### Tilbakeskriving

For tilbakeskriving av PDF fra Nav til EPJ må følgende FHIR ressurser være tilgjengelige i EPJ FHIR
server:

- [DocumentReference](./document-reference.md)

For tilbakeskriving av _FHIR-strukturerte_ data bør følgende FHIR ressurs være tilgjengelig i EPJ
FHIR server:

- [QuestionnaireResponse](./questionnaire-response.md)

[Bundle](./bundle.md) er planlagt, men ikke i bruk i dag.
