# Encounter

Vårt behov: **Lese**

_Relevante referanser:_

- [Encounter](https://www.hl7.org/fhir/R4/encounter.html) (HL7)

HL7 Norge har ingen no-basis-profil for Encounter, så kravene kommer fra R4 og Nav.

## Eksempel JSON-struktur for Encounter

Feltene `status` og `class` er med fordi de er påkrevd i R4 (1..1). `class` leses ikke av syk-inn i
dag. `subject`, `participant` og `diagnosis` er valgfrie i R4, men er med som kontekst som kan
brukes til å validere launch-konteksten, nå og senere.

```json
{
  "resourceType": "Encounter",
  "id": "unik encounter ident",
  "subject": {
    "reference": "Patient/<Pasienten encounter gjelder for>"
  },
  "participant": [
    {
      "individual": {
        "reference": "Practitioner/<Lege som startet encounteret>"
      }
    }
  ],
  "diagnosis": [
    {
      "condition": {
        "reference": "Condition/<Referanse til Condition i FHIR API>"
      }
    }
  ],
  "serviceProvider": {
    "reference": "Organization/<Helseforetaket som utfører konsultasjonen>"
  },
  "status": "in-progress",
  "class": {
    "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
    "code": "AMB | VR"
  }
}
```

## Krav

Se [oversikten](_oversikt.md#hvordan-kravene-leses) for forklaring av kildene.

- **R4:** `status` (1..1) og `class` (1..1). syk-inn leser `status`, men sjekker ikke verdien.
  `class` kontrolleres ikke i dag.
- **Nav:** `serviceProvider.reference` til `Organization/<id>`. R4 har `serviceProvider` som 0..1.
- Konsultasjonens id kommer fra SMART launch-konteksten (`encounter`), og Encounter leses med
  `Encounter/<id>`.

### Kontekstfelter

Disse feltene er ikke harde krav fra R4 eller Nav, og syk-inn bruker dem ikke i dag:

| Felt                     | R4 kardinalitet             |
| ------------------------ | --------------------------- |
| `subject`                | 0..1                        |
| `participant`            | 0..\*                       |
| `participant.individual` | 0..1                        |
| `diagnosis`              | 0..\*                       |
| `diagnosis.condition`    | 1..1 når `diagnosis` finnes |

### Dagens begrensninger

- Er `subject`, `participant` eller `diagnosis` med, må `subject.reference`,
  `participant[].individual.reference` og `diagnosis[].condition.reference` finnes, ellers avvises
  hele Encounter. I R4 er `participant.individual` og `Reference.reference` 0..1.
- `serviceProvider.reference` må være en relativ referanse på formen `Organization/<id>`.
- Diagnoser hentes ikke fra `Encounter.diagnosis`, men med søket `Condition?encounter=<id>`, se
  [Condition](condition.md).
- Pasient og sykmelder identifiseres fra launch-konteksten, ikke fra `subject` og
  `participant.individual`.

## Begrunnelse

- Subject kan brukes til å validere at konsultasjonen gjelder pasienten fra launch-konteksten
- Participant/individual kan brukes til å validere at sykmelder fra launch-konteksten deltar i
  konsultasjonen
- ServiceProvider/reference benyttes for å identifisere sykmelders organisasjon for den aktuelle
  konsultasjonen
- Diagnosis gir diagnosene som er knyttet til konsultasjonen, men er ikke påkrevd

### Notater

- Diagnosis.Condition.Type og Referanse - I følge R4 FHIR spec gjør rom for at man kan ha en
  referanse (literal reference) eller selve objektet (logical reference). Literal reference er da
  FHIR referansen til Condition, f.eks. Condition/unik-uuid-1234.
  [Dersom begge er til stede foretrekkes literal reference](https://www.hl7.org/fhir/R4/references.html#logical).
- Class - kan brukes til å skille fysisk og virtuell konsultasjon etter norsk kodeverk. For
  v3-ActCode er AMB (pasienten er fysisk til stede) og VR (virtuelt) aktuelle verdier. Ikke et krav
  i dag.

## Planlagt

Ikke i bruk i dag og ikke påkrevd:

- `type` med Kontakttype (`urn:oid:2.16.578.1.12.4.1.1.8432`) for å avgjøre konsultasjonstype.
  Valideringsrapporten i `@navikt/smart-on-fhir` gir en advarsel når den mangler.
- Kontroll av at sykmeldingen kun sendes i rett type konsultasjon, basert på `class`, `type` og
  `status`.
- Kryssjekk av `subject` og `participant.individual` mot launch-konteksten.
