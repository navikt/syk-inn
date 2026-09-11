# Test data

Test persons for the acceptance test suite in [`test-steps.md`](./test-steps.md). Nav creates these
using Dolly (Nav's internal synthetic test suite) and Synthpop (NHN's test suite), fills in a copy
of this file per vendor, and sends it together with the test scenarios. Do not commit filled-in
copies of this file: fødselsnummer are personal data, even for synthetic test persons.

## Patients

| #   | Fødselsnummer | First name | Last name | Gender | Requirements                                                                                                           |
| --- | ------------- | ---------- | --------- | ------ | ---------------------------------------------------------------------------------------------------------------------- |
| 1   |               |            |           |        |                                                                                                                        |
| 2   |               |            |           |        |                                                                                                                        |
| 3   |               |            |           |        |                                                                                                                        |
| 4   |               |            |           |        |                                                                                                                        |
| 5   |               |            |           |        |                                                                                                                        |
| 6   |               |            |           |        | Must have no employer                                                                                                  |
| 7   |               |            |           |        |                                                                                                                        |
| 8   |               |            |           |        |                                                                                                                        |
| 9   |               |            |           |        |                                                                                                                        |
| 10  |               |            |           |        |                                                                                                                        |
| 11  |               |            |           |        |                                                                                                                        |
| 12  |               |            |           |        |                                                                                                                        |
| 13  |               |            |           |        |                                                                                                                        |
| 14  |               |            |           |        |                                                                                                                        |
| 15  |               |            |           |        | Unused. Not referenced by any step in `test-steps.md`. Kept from the source workbook; drop it or add the missing step. |
| 16  |               |            |           |        | Must have an invalid fødselsnummer                                                                                     |

## Sykmeldere (practitioners)

| #   | Fødselsnummer | First name | Last name | HPR number |
| --- | ------------- | ---------- | --------- | ---------- |
| 1   |               |            |           |            |
