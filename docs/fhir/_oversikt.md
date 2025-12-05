# FHIR ressurser for _preutfylling_ fra EPJ

Nav har utviklet en SMART on FHIR applikasjon for ny sykmelding.

## Kontekst

Under er en beskrivelse av hvilke FHIR ressurser Nav trenger for preutfylling av sykmelding.

### Forhåndsutfylling

For forhåndsutfylling fra EPJ til Nav må følgende FHIR ressurser være tilgjengelige i
EPJ FHIR server:

- [Patient](./patient.md)
- [Practitioner](./practitioner.md)
- [Condition](./condition.md)
- [Encounter](./encounter.md)
- [Organization](./organization.md)

# FHIR ressurser for _tilbakeskriving_ til EPJ

## Kontekst

Under er en beskrivelse av hvilke FHIR ressurser Nav trenger for preutfylling av sykmelding.

### Tilbakeskriving

For tilbakeskriving fra Nav til EPJ må følgende FHIR ressurser være tilgjengelige i
EPJ FHIR server eller overføres til web-applikasjonen:

- [DocumentReference](./document-reference.md)
