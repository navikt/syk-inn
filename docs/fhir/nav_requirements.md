# Navs krav til helsevirksomheter og EPJ-leverandører

Nav utvikler en ny løsning for innsending av sykmeling som skal erstatte løsningen som i dag finnes
i et titalls forskjellige EPJ-systemer. Nav vil tilby en SMART on FHIR applikasjon, og en
selvstendig webapplikasjon som kan benyttes av de leverandørene som ikke har støtte for SMART on
FHIR.

Nav står overfor flere utfordringer knyttet til standardisering, leverandørsamarbeid og sikkerhet.
For å løse disse må Nav ta en mer aktiv og ledende rolle, samarbeide tett med Helsedirektoratet og
andre aktører, og sikre tydelig kommunikasjon og krav til leverandører.
I de fleste tilfeller finnes det eksisterende standarder som leverandørene (og helsevirksomhetene)
må oppfylle, mens det på noen områder er behov for etablere nye standarder.
Nav har utarbeidet noen krav til helsevirksomheter (legekontor, RHF, kommuner o.l.) som skal benytte
Navs nye løsninger, samt krav til EPJ-leverandører. En del krav gjelder kun for SMART on FHIR
løsningen, mens noen er generelle og gjelder begge løsningene.

NB! Nav jobber nå med en pilot for SMART on FHIR, og det kan bli endringer i kravene som følge av
denne pilloten. Det kan også komme endringer i kravene til selvstendig webapplikasjon.

## Felles krav til helsevirksomheter og EPJ-leverandører

### Generelle krav

| Kategori  | Krav                        | Beskrivelse                                                                                                                                                                                                                                                                                                                | Krav |
| --------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| Sikkerhet | Oppdatert nettleser versjon | Bruk kun siste versjoner av nettleser med den nyeste sikkerhetsfunksjonaliteten og de siste sikkerhetsoppdateringene. Ref. [2.8.2 i NSMs Grunnprinsipper for IKT-Sikkerhet](https://nsm.no/regelverk-og-hjelp/rad-og-anbefalinger/grunnprinsipper-for-ikt-sikkerhet/beskytte-og-opprettholde/beskytt-e-post-og-nettleser/) | Må   |
| Sikkerhet | Autentisering mot HelseID   | EPJ bør benytte HelseID for autentisering og autorisasjon                                                                                                                                                                                                                                                                  | Bør  |

### SMART on FHIR

| Kategori  | Krav                                           | Beskrivelse                                                                                                                                                                                                                                                                                                                                        | Krav |
| --------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| Nav       | Sertifisert EPJ                                | Helsevirksomheter må benytte et EPJ-system, og versjon av systemet som er godkjent av Nav.                                                                                                                                                                                                                                                         | Må   |
| Nav       | Oppgraderinger                                 | Nav vil oppgradere sykmeldingsapplikasjonen forløpende (flere ganger om dagen). Helseforetak og EPJ-leverandørene vil kun bli involvert når endringene medfører:<br>- Utvikling i EPJ<br>- Endring i infrastruktur eller teknisk konfigurasjon hos helseinstitusjon eller EPJ<br>- Endring i juridiske rammer eller ansvarsforhold mellom aktørene | Må   |
| Nav       | Åpen .well-known/smart-configuration endepunkt | Nav må ha tilgang til godt kjente endepunkter (såkalte .well-known filer) for autentisering og riktig bruk av SMART on FHIR. Se [conformance dokumentasjon](https://healthedata1.github.io/smart-app-launch/conformance.html#using-well-known).                                                                                                    | Må   |
| Sikkerhet | Nettverk og tilgjengelighet til API            | FHIR- og Authserver må være tilgjengelig fra Navs infrastruktur/server.                                                                                                                                                                                                                                                                            | Må   |

## Krav til EPJ-leverandører som skal benytte SMART on FHIR

| Underkategori         | Krav                                             | Beskrivelse                                                                                                                                                                                                                                                                                                                      | Krav |
| --------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| Eksisterende standard | Påkrevde FHIR ressurser for preutfylling fra EPJ | For preutfylling fra EPJ til sykmeldingsapplikasjonen må følgende FHIR ressurser være definert og tilgjengelige i EPJ:<br>- Pasient (no-basis-Patient)<br>- Helsepersonell (no-basis-Practitioner)<br>- Helsepersonell rolle (no-basis-PractitionerRole)<br>- Organisasjon (no-basis-Organization)<br>- Konsultasjon (Encounter) | Må   |
| Eksisterende standard | Tilbakeskriving av PDF til journal               | For tilbakeskriving fra sykmeldingsapplikasjonen til EPJ må følgende FHIR ressurser være definert og tilgjengelige for skriving i EPJ:<br>- DocumentReference (DocumentReference)<br>- Binary (Binary)                                                                                                                           | Må   |
| Eksisterende standard | Kodeverk                                         | Norsk kodeverk spesifisert av Nav må benyttes i FHIR ressursene                                                                                                                                                                                                                                                                  | Må   |
| Eksisterende standard | SmartApp Launch Implementation guide             | SMART on FHIR implementasjonen må være samsvar med Smart App Launch Implementation Guide (v2.2.0: STU 2.2)                                                                                                                                                                                                                       | Må   |
| Eksisterende standard | FHIR versjon                                     | EPJ-leverandør må tilby FHIR ressurser på versjon R4                                                                                                                                                                                                                                                                             | Må   |
| Nav                   | Testmiljø                                        | EPJ-leverandør må tilby et testmiljø som Nav kan benytte for testing av SMART on FHIR applikasjon i EPJ.                                                                                                                                                                                                                         | Må   |
| Nav                   | Testmiljø                                        | Testmiljøet må også kunne tilgjengeliggjøres for leger som skal teste den nye løsningen.                                                                                                                                                                                                                                         | Må   |
| Nav                   | Testmiljø                                        | Testmiljøet bør kunne benytte syntetiske testdata fra SyntPop.                                                                                                                                                                                                                                                                   | Bør  |
| Eksisterende standard | Valgfrie FHIR ressurser for preutfylling fra EPJ | For preutfylling fra EPJ til sykmeldingsapplikasjonen bør følgende FHIR ressurs være tilgjengelig i EPJ:<br>- Diagnose (Condition)                                                                                                                                                                                               | Bør  |

<!-- TODO: Legg til når strukturert tilbakeskriving er definert -->
<!--| Ny standard | Tilbakeskriving av strukturerte data til EPJ | TODO | Bør |-->

## Kodeverk

Følgende kodeverk benyttes av Nav i den nye sykmeldingsløsningen:

| Betegnelse          | Detaljer            | OID                      | Gyldige verdier                               |
| ------------------- | ------------------- | ------------------------ | --------------------------------------------- |
| Helsedirektoratet   |                     | 2.16.578.1.12.4.1        |                                               |
| Kodeverk            |                     | 2.16.578.1.12.4.1.1      |                                               |
| Kodeverk            | Kontakttype         | 2.16.578.1.12.4.1.1.8432 | 1 - Utredning<br>6 - Videokonsultasjon<br>7 - |
| Telefonkonsultasjon |                     |                          |                                               |
| Kodeverk            | ICD10               | 2.16.578.1.12.4.1.1.7110 |                                               |
| Kodeverk            | ICPC-2              | 2.16.578.1.12.4.1.1.7170 |                                               |
| Kodeverk            | Dokumenttyper       | 2.16.578.1.12.4.1.1.9602 | J01-2 - Sykmeldinger og trygdesaker           |
| HER-id              |                     | 2.16.578.1.12.4.1.2      |                                               |
| Identifikator       |                     | 2.16.578.1.12.4.1.4      |                                               |
| Identifikator       | Fødselsnummer       | 2.16.578.1.12.4.1.4.1    |                                               |
| Identifikator       | D-nummer            | 2.16.578.1.12.4.1.4.2    |                                               |
| Identifikator       | HPR-nummer          | 2.16.578.1.12.4.1.4.4    |                                               |
| Identifikator       | Organisasjonsnummer | 2.16.578.1.12.4.1.4.101  |                                               |
