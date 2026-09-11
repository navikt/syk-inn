# Onboarding a new EHR (EPJ) vendor to the old flow (ebXML via emottak), part 2

> [!WARNING]
>
> This flow is deprecated and will be turned off in 2028.
>
> Use SMART on FHIR as the preferred method of exchanging data with Nav. See
> [`docs/smart/getting-started.md`](../smart/getting-started.md).

> [!WARNING]
>
> The validation steps are manual and will not be automated in the future since this method is
> deprecated. We do not guarantee a short ETC (estimated time to completion) as this is subject to
> existing prioritised work.

## Prerequisites:

- [Getting started part 1](./getting-started-1.md) is completed.

## Step 1 - contact

Send an email to [nav.sykmelding@nav.no](mailto:nav.sykmelding@nav.no) in order to start the process
of validating your implementation for sending sykmelding to Nav.

Nav will then start a correspondence with your team to create a test suite you must pass before you
can send sykmeldinger.

## Step 2 - setting up test data

1. Team sykmelding creates test persons using Dolly (Navs internal synthetic test suite) and
   Synthpop (NHNs test suite)
2. Nav enters the created test persons into [`test-data.md`](./test/test-data.md).
3. The filled-in test data is sent to the EHR vendor together with
   [`test-steps.md`](./test/test-steps.md)
4. EHR vendor starts testing the scenarios

## Step 3 - validating the data

Upon completing the test scenarios, the EHR vendor will notify Nav that the scenarios can be
validated.

If any tests fail, or we see unexpected behaviour you will be notified and asked to run the entire
test suite again. This is to ensure that any code changes have not affected other parts of the
sykmelding.

The validation steps are documented in [`test-steps.md`](./test/test-steps.md). The vendor fills in
the reporting table at the bottom of that file and returns it to Nav.

## Step 4 - production ready

If the validation goes well you are allowed to start sending sykmeldinger in production.
