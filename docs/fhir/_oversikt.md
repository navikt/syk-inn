# FHIR ressurser for _preutfylling_ fra EPJ

Nav har utviklet en SMART on FHIR applikasjon for ny sykmelding.

## Launch-kontekst

| Parameter   | Kilde         | Krav                                                                                       |
| ----------- | ------------- | ------------------------------------------------------------------------------------------ |
| `patient`   | Token-respons | Påkrevd. Gyldig FHIR-id.                                                                   |
| `encounter` | Token-respons | Påkrevd. Gyldig FHIR-id.                                                                   |
| `fhirUser`  | id_token      | Påkrevd. Relativ referanse på formen `Practitioner/<id>`. Absolutt URL støttes ikke i dag. |

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
