# FHIR ressurser for preutfylling fra EPJ

## Kontekst

Nav skal utvikle en SMART on FHIR applikasjon for ny sykmelding.
Under er ein beskrivelse av hvilke FHIR ressurser Nav trenger for preutfylling av sykmelding.

### Forhåndsutfylling

For forhåndsutfylling fra EPJ til Nav forventes det at følgende FHIR ressurser er tilgjengelige i EPJ (SMART on FHIR) eller
overføres til web-applikasjonen:

- Pasient ([no-basis-Patient (simplifier)](https://simplifier.net/hl7norwayno-basis/nobasispatient]))
- Helsepersonell ([no-basis-Practitioner (simplifier)](https://simplifier.net/hl7norwayno-basis/nobasispractitioner))
- Organisasjon ([no-basis-Organization (simplifier)](https://simplifier.net/hl7norwayno-basis/nobasisorganization))
- Konsultasjon ([Encounter (HL7)](https://www.hl7.org/fhir/encounter.html))
- Diagnose ([Condition (simplifier)](https://simplifier.net/packages/hl7.fhir.r4.examples/4.0.1/files/98752))

---

Navs detaljerte beskrivelser per ressurs:

- [Patient](./patient.md)
- [Practitioner](./practitioner.md)
- [Condition](./condition.md)
- [Encounter](./encounter.md)
- [Organization](./organization.md)

# FHIR ressurser for tilbakeskriving til EPJ

## Kontekst

Nav skal utvikle en SMART on FHIR applikasjon for ny sykmelding.
Under er ein beskrivelse av hvilke FHIR ressurser Nav trenger for tilbakeskriving av sykmelding til EPJ.

### Tilbakeskriving

For tilbakeskriving fra Nav til EPJ forventes det at følgende FHIR ressurser er tilgjengelige i EPJ (SMART on FHIR) eller overføres til web-applikasjonen:

- DocumentReference ([DocumentReference](https://www.hl7.org/fhir/documentreference.html]))

Detaljerte beskrivelser per ressurs:

- [DocumentReference](./document-reference.md)
