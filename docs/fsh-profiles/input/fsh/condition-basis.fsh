Profile: NoBasisCondition
Parent: Condition
Id: no-basis-condition
Title: "Norwegian Basis Condition"
Description: "Generic basis profile for Condition in Norwegian FHIR R4, allowing ICD-10 and ICPC-2 codes."

* subject 1..1 MS
* subject only Reference(Patient or NoBasisPatient)

* code 1..1 MS
* code.coding 1..* MS
* code.coding.system from NoBasisConditionCodeVS (required)
* code.coding.code 1..1 MS
* code.coding.display 0..1
