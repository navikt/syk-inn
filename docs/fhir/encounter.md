# Encounter

Vårt behov: **Lese**

_Relevante referanser:_

- [Encounter](https://www.hl7.org/fhir/R4/encounter.html) (HL7)

Det finnes ingen no-basis-profil for Encounter.

## Eksempel JSON-struktur for Encounter

`status` og `class` er påkrevd i R4. `subject`, `participant` og `diagnosis` er valgfrie, men tas
med som kontekst for konsultasjonen.

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

| Felt                     | R4   | Nav     | Merknad                                                                              |
| ------------------------ | ---- | ------- | ------------------------------------------------------------------------------------ |
| `status`                 | 1..1 | Påkrevd | Verdien kontrolleres ikke.                                                           |
| `class`                  | 1..1 | Påkrevd | Verdien kontrolleres ikke.                                                           |
| `serviceProvider`        | 0..1 | Påkrevd | Relativ referanse på formen `Organization/<id>`.                                     |
| `subject`                | 0..1 | Valgfri | Må ha `reference` hvis feltet er med.                                                |
| `participant.individual` | 0..1 | Valgfri | Må ha `reference` hvis `participant` er med.                                         |
| `diagnosis.condition`    | 1..1 | Valgfri | Må ha `reference` hvis `diagnosis` er med. Leses ikke, se [Condition](condition.md). |

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
- Class kan brukes til å skille fysisk og virtuell konsultasjon etter norsk kodeverk. For v3-ActCode
  er AMB (pasienten er fysisk til stede) og VR (virtuelt) aktuelle verdier.

## Planlagt

- `type` med Kontakttype (`urn:oid:2.16.578.1.12.4.1.1.8432`) for å avgjøre konsultasjonstype.
- Kontroll av konsultasjonstype basert på `class`, `type` og `status`.
- Kryssjekk av `subject` og `participant.individual` mot launch-konteksten.
