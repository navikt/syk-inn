Profile: NoBasisEncounter
Parent: Encounter
Id: no-basis-encounter
Title: "Norwegian Basis Encounter"
Description: "Basisprofil for Encounter i norsk FHIR R4 kontekst."

* status 1..1 MS
* class 1..1 MS
* class from http://terminology.hl7.org/CodeSystem/v3-ActCode

* type 1..* MS
* type.coding.system = "urn:oid:2.16.578.1.12.4.1.1.8432"

* subject 1..1 MS
* subject only Reference(Patient)

* participant 0..* MS
* participant.individual only Reference(Practitioner)

* diagnosis 0..* MS
* diagnosis.condition only Reference(Condition)

* serviceProvider 0..1 MS
* serviceProvider only Reference(Organization)
