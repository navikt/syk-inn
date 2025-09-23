Profile: NoBasisPatient
Parent: Patient
Id: no-basis-Patient
Title: "no-basis-Patient"
Description: "Basisprofil for Norwegian Patient information. Defined by The Norwegian Directorate of eHealth and HL7 Norway. Should be used as a basis for further profiling in use-cases where specific identity information is needed. The basis profile is open, but derived profiles should close down the information elements according to specification relevant to the use-case."
* ^meta.versionId = "3"
* ^meta.lastUpdated = "2018-06-15T13:55:18.157+00:00"
* ^url = "http://hl7.no/fhir/StructureDefinition/no-basis-Patient"
* ^version = "2.0.10"
* ^date = "2019-05-20"
* . ^alias = "Pasient"
* extension ^slicing.discriminator.type = #value
* extension ^slicing.discriminator.path = "url"
* extension ^slicing.rules = #open
* extension contains $patient-citizenship named citizenship 0..*
* extension[citizenship] ^short = "The citizenship of the patient"
* extension[citizenship] ^definition = "The citizenship of the patient. should be a country code from ISO 3166 code system"
* extension[citizenship] ^alias = "statsborgerskap"
* extension[citizenship].extension ^slicing.discriminator.type = #value
* extension[citizenship].extension ^slicing.discriminator.path = "url"
* extension[citizenship].extension ^slicing.rules = #open
* extension[citizenship].extension[code] from urn:iso:std:iso:3166 (example)
* extension[citizenship].extension[code] ^sliceName = "code"
* extension[citizenship].extension[code] ^definition = "no-basis-Patient introduces iso 3166 codes\n\nNation code representing the citizenship of patient."
* identifier ^slicing.discriminator.type = #value
* identifier ^slicing.discriminator.path = "system"
* identifier ^slicing.rules = #open
* identifier ^short = "Identifier for this patient"
* identifier ^definition = "An identifier for this patient. Should be at Fødselsnummer, Felles hjelpenummer, D-nummer or locally assigned H-nummer"
* identifier contains
    FNR 0..* and
    FHN 0..* and
    DNR 0..* and
    HNR 0..*
* identifier[FNR] ^short = "Norwegian FNR"
* identifier[FNR] ^definition = "Fødselsnummer for the patient. Fødselsnummer as one of the possible patient identifier, should at least be sent unless there is a reason not to. Reasons for not sending the Fødselsnummer include but are not limited to, research and apps without a contract for processing data.\n\nMultiple FNR can exist for a person. If several FNR is provided the time period that each identifier is valid should be provided. No information about period is required when only one FNR is provided."
* identifier[FNR].system 1..
* identifier[FNR].system = "urn:oid:2.16.578.1.12.4.1.4.1" (exactly)
* identifier[FNR].system ^short = "Identification of the Norwegian FNR"
* identifier[FNR].system ^definition = "Identifies that this is a Norwegian Fødselsnummer"
* identifier[FNR].value 1..
* identifier[FNR].value ^short = "The actual Fødselsnummer"
* identifier[FNR].value ^definition = "The Norwegian Fødselsnummer"
* identifier[FNR].value ^alias = "Fødselsnummer"
* identifier[FNR].value ^example.label = "Fødselsnummer"
* identifier[FNR].value ^example.valueString = "13057444850"
* identifier[FHN] ^short = "Felles hjelpenummer used for the patient"
* identifier[FHN] ^definition = "Felles hjelpenummer for the patient. Felles hjelpenummer as one of the possible patient identification numbers. The norwegian Felles hjelpenummer shoud only be used when the Fødselsnummer og D-number is unknown."
* identifier[FHN].system 1..
* identifier[FHN].system = "urn:oid:2.16.578.1.12.4.1.4.3" (exactly)
* identifier[FHN].system ^short = "Identification of the Norwegian felles hjelpenummer"
* identifier[FHN].system ^definition = "Norwegian felles hjelpenummer"
* identifier[FHN].value 1..
* identifier[FHN].value ^short = "The actual Hjelpenummer"
* identifier[FHN].value ^definition = "The actual Norwegian Hjelpenummer"
* identifier[DNR] ^short = "The D-nummer of the patient"
* identifier[DNR] ^definition = "The D-nummer of the patient. (assigned by the norwegian Skatteetaten)"
* identifier[DNR].system 1..
* identifier[DNR].system = "urn:oid:2.16.578.1.12.4.1.4.2" (exactly)
* identifier[DNR].system ^short = "The identification of the D-nummer"
* identifier[DNR].system ^definition = "The identification of the Norwegian D-nummer"
* identifier[DNR].value 1..
* identifier[DNR].value ^short = "The actual D-nummer"
* identifier[DNR].value ^definition = "The actual Norwegian D-nummer"
* identifier[HNR] ^short = "A locally assigned H-nummer"
* identifier[HNR] ^definition = "A locally assigned H-nummer. If this identifier is used, information about the assigner is mandatory. Merk at lokale hjelpenummer (H-nummer) for pasient ikke garanterer at kombinasjonen system og value er gir unik identifikasjon, siden disse tildeles på lokalt i det enkelte kliniske fagsystem. Felles nasjonale hjelpenummer utstedt av tjenesten for felles hjelpenummer er imidlertid unike i Norge (og globalt unike i kombinasjon med system)."
* identifier[HNR].type.coding.system 1..
* identifier[HNR].type.coding.system = "urn:oid:2.16.578.1.12.4.1.1.8327" (exactly)
* identifier[HNR].type.coding.system ^definition = "CodeSystem on Volven for official personal identifiers.\nThe identification of the code system that defines the meaning of the symbol in the code."
* identifier[HNR].type.coding.code 1..
* identifier[HNR].type.coding.code = #HNR (exactly)
* identifier[HNR].type.coding.code ^definition = "The code for local Hjelpenummer in the CodeSystem\n\nA symbol in syntax defined by the system. The symbol may be a predefined code or an expression in a syntax defined by the coding system (e.g. post-coordination)."
* identifier[HNR].system = "HNR" (exactly)
* identifier[HNR].value 1..
* identifier[HNR].value ^definition = "The actual Hjelpenummer.\n\nThe portion of the identifier typically relevant to the user and which is unique within the context of the system."
* identifier[HNR].assigner 1..
* identifier[HNR].assigner ^definition = "Assigner is mandatory for localy assigne Hjelpenummer.\n\nOrganization that issued/manages the identifier."
* name only $no-basis-HumanName
* address only $no-basis-Address
* address ^short = "Norwegian address"
* address ^definition = "http://hl7.no/fhir/StructureDefinition/no-basis-Address"
* contact.name only $no-basis-HumanName
* contact.address only $no-basis-Address
* generalPractitioner only Reference(Organization or Practitioner or PractitionerRole or $no-basis-Practitioner or $no-basis-PractitionerRole or $no-basis-Organization)
* managingOrganization only Reference(Organization or $no-basis-Organization)