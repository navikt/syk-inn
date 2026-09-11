# Test steps

Acceptance test scenarios for sending sykmelding to Nav over ebXML. One row per step. Patient and
sykmelder numbers refer to [`test-data.md`](./test-data.md); every step uses sykmelder 1.

## Expected outcome legend

`Expected outcome` is one of:

- `Accepted`: submits and arrives at Nav. Default check (skip unless the row's `Verify` column says
  otherwise): the sykmelding arrives at Nav, updates Infotrygd correctly, and is visible and can be
  opened in Gosys.
- `Rejected`: the EPJ may or may not block this client-side. If it does not and forwards the
  message, Nav must reject it and return it to the EPJ. Vendor reports whether the EPJ blocked it;
  if not, Nav confirms the rejection.
- `Blocked by EPJ`: the EPJ must refuse to submit at all, the message must never reach Nav.
- `No submission`: nothing is sent. Verify only that the expected question appears in the UI.

`Screenshots` = `yes` means take screenshots of the relevant printouts/copies and email them to Nav
alongside the test report.

## Scenarios

| #   | Scenario                                       | Patient | Test parameters                                                                                                            | Expected outcome | Verify                                                                                                                                                    | Screenshots |
| --- | ---------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 1   | Standard sykmelding                            | 1       | R99 (ICPC-2) / J989 (ICD-10), 3 weeks                                                                                      | Accepted         | -                                                                                                                                                         | no          |
| 2   | 100% sykmelding, simplified (infection)        | 2       | R80 / J111, 15 days                                                                                                        | Accepted         | Fields 4.3.3/4.3.4 are not asked and not filled in                                                                                                        | no          |
| 3   | 100% sykmelding, under 8 weeks                 | 3       | A03 / R509, 15 days                                                                                                        | Accepted         | Fields 4.3.3/4.3.4 are asked and filled in                                                                                                                | no          |
| 4   | 100% sykmelding, over 7 weeks                  | 4       | A92 / T784, 9 weeks                                                                                                        | Accepted         | 4.3.3/4.3.4 (with sub-questions) and 6.3 are asked and filled in; Arena gets the activity-requirement event                                               | no          |
| 5   | Extended info at 39 weeks + AAP                | 4       | Extension of step 4, total duration over 40 weeks                                                                          | Accepted         | 4.3.3/4.3.4, 6.4, 6.5 mandatory and filled in; 6.6 (AAP) optional, fill in anyway; correct Arena event; screenshot matches the display file and Nav's PDF | yes         |
| 6   | Friskmelding (return to work)                  | 5       | R89 / Q349, 9 weeks, field 5.1 = No                                                                                        | Accepted         | Section 5.2 is asked, at least one field filled in                                                                                                        | no          |
| 7   | Friskmelding, patient without employer         | 6       | S84 / L010, 9 weeks, field 5.1 = No                                                                                        | Accepted         | Section 5.3 is asked, at least one field filled in                                                                                                        | no          |
| 8   | Printouts                                      | 7       | K99 / I516, 3 weeks, field 9.1 filled in                                                                                   | Accepted         | Printouts match the EPJ guidance standard; Gosys matches the screenshots                                                                                  | yes         |
| 9   | Printout: shield patient from medical info     | 8       | D71 / B269, 3 weeks, field 3.7 checked                                                                                     | Accepted         | As step 8, particular focus on the patient's copy                                                                                                         | yes         |
| 10  | Special characters in field 8.2                | 9       | N79 / S060, 3 weeks, field 8.1 checked, field 8.2 = `VI TESTER TEGN >#%()=&/-`                                             | Accepted         | "Message from treating practitioner" event in Arena, with the correct text                                                                                | no          |
| 11  | Extended info (section 6) at 17 weeks          | 10      | L84 / M545, 17 weeks                                                                                                       | Accepted         | 4.3.3/4.3.4 and 6.3/6.4 mandatory and filled in                                                                                                           | no          |
| 12  | Feedback to Nav                                | 11      | K99 / I516, 3 weeks, fields 7.2/7.3 filled in                                                                              | Accepted         | Correct event shows up in Arena                                                                                                                           | no          |
| 13  | Symptom diagnosis to disease diagnosis         | 3       | A04 / R53, 12 weeks                                                                                                        | No submission    | The question about the diagnosis change appears                                                                                                           | no          |
| 14  | Other statutory absence reason, no diagnosis   | 12      | No main diagnosis, other statutory absence reason given                                                                    | Accepted         | Sykmelding is in Gosys                                                                                                                                    | no          |
| 15  | No diagnosis and no statutory absence reason   | 4       | -                                                                                                                          | Rejected         | -                                                                                                                                                         | no          |
| 16  | Treatment days                                 | 13      | 18-day period, 3 treatment days                                                                                            | Accepted         | In Gosys, routed to manual processing                                                                                                                     | no          |
| 17  | Too many treatment days for the period         | 9       | 18-day period, 4 treatment days                                                                                            | Rejected         | -                                                                                                                                                         | no          |
| 18  | Graded sykmelding, absence percentage too low  | 10      | 15%                                                                                                                        | Rejected         | -                                                                                                                                                         | no          |
| 19  | Avventende sykmelding, missing mandatory field | 11      | 16 days, employer-input field left empty                                                                                   | Rejected         | -                                                                                                                                                         | no          |
| 20  | Avventende sykmelding, valid                   | 14      | 16 days, employer-input field filled in                                                                                    | Accepted         | -                                                                                                                                                         | no          |
| 21  | Avventende sykmelding, too long                | 13      | 17 days                                                                                                                    | Rejected         | -                                                                                                                                                         | no          |
| 22  | Avventende combined with another type          | 14      | Period 1: avventende, 10 days. Period 2: 100%, 20 days. No gap or overlap between periods                                  | Rejected         | -                                                                                                                                                         | no          |
| 23  | Forward-dated more than 30 days                | 9       | Start date 31 days after today's date/signature date                                                                       | Rejected         | -                                                                                                                                                         | no          |
| 24  | Backdated                                      | 14      | Start date 14 days before today's date/signature date, end date today, fields 11.1/11.2 filled in (backdating over 8 days) | Accepted         | -                                                                                                                                                         | yes         |
| 25  | Overlapping periods                            | 11      | Period 1 (graded) end date equals period 2 (100%) start date                                                               | Rejected         | Check Gosys and the processing attachment                                                                                                                 | no          |
| 26  | Invalid fødselsnummer                          | 16      | -                                                                                                                          | Blocked by EPJ   | Message must not exist in any of Nav's case systems                                                                                                       | no          |

## Reporting your results

Copy this table, fill in one row per step, and return it to Nav as a PDF, CSV or XLSX.

| #   | Status  | Actual result | Error id | Timestamp |
| --- | ------- | ------------- | -------- | --------- |
| 1   | Not run |               |          |           |
| 2   | Not run |               |          |           |
| 3   | Not run |               |          |           |
| 4   | Not run |               |          |           |
| 5   | Not run |               |          |           |
| 6   | Not run |               |          |           |
| 7   | Not run |               |          |           |
| 8   | Not run |               |          |           |
| 9   | Not run |               |          |           |
| 10  | Not run |               |          |           |
| 11  | Not run |               |          |           |
| 12  | Not run |               |          |           |
| 13  | Not run |               |          |           |
| 14  | Not run |               |          |           |
| 15  | Not run |               |          |           |
| 16  | Not run |               |          |           |
| 17  | Not run |               |          |           |
| 18  | Not run |               |          |           |
| 19  | Not run |               |          |           |
| 20  | Not run |               |          |           |
| 21  | Not run |               |          |           |
| 22  | Not run |               |          |           |
| 23  | Not run |               |          |           |
| 24  | Not run |               |          |           |
| 25  | Not run |               |          |           |
| 26  | Not run |               |          |           |

`Status` is one of `OK`, `Failed`, `Not ready`, `Not run`.
