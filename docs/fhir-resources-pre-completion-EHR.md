# FHIR ressurser for preutfylling fra EPJ

## Kontekst
Nav skal utvikle en SMART on FHIR applikasjon for ny sykmelding
Under er ein beskriver hvilke FHIR ressurser Nav trenger for preutfylling for sykmelding. 


### Preutfylling
For preutfylling fra EPJ til Nav forventes det at følgende FHIR ressurser er tilgjengelige i EPJ (SMART on FHIR) eller overføres til webapplikasjon:
 - Pasient ([no-basis-Patient](https://simplifier.net/hl7norwayno-basis/nobasispatient]))
 - Helsepersonell ([no-basis-Practitioner](https://simplifier.net/hl7norwayno-basis/nobasispractitioner))
 - Helsepersonell rolle ([no-basis-PracitionerRole](https://simplifier.net/hl7norwayno-basis/nobasispractitionerrole))
 - Organisasjon ([no-basis-Organization](https://simplifier.net/hl7norwayno-basis/nobasisorganization))
 - Konsultasjon ([Encounter](https://www.hl7.org/fhir/encounter.html))
 - Diagnose ([Condition](https://simplifier.net/packages/hl7.fhir.r4.examples/4.0.1/files/98752))