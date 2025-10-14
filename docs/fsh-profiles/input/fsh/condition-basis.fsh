Profile: NoBasisCondition
Parent: Condition
Id: no-basis-condition
Title: "Norwegian Basis Condition"
Description: "Generic basis profile for Condition in Norwegian FHIR R4, allowing ICD-10 and ICPC-2 codes using open slicing."

* subject 1..1
* subject only Reference(Patient or NoBasisPatient)

* code 1..1
* code.coding 1..*
* code.coding ^slicing.discriminator.type = #pattern
* code.coding ^slicing.discriminator.path = "system"
* code.coding ^slicing.rules = #open
* code.coding contains
    icd10 0..1 and
    icpc2 0..1

* code.coding[icd10].system = "urn:oid:2.16.578.1.12.4.1.1.7110"  // ICD-10
* code.coding[icd10].code 1..1
* code.coding[icd10].display 0..1

* code.coding[icpc2].system = "urn:oid:2.16.578.1.12.4.1.1.7170"  // ICPC-2
* code.coding[icpc2].code 1..1
* code.coding[icpc2].display 0..1
