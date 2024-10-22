# syk-inn

## Overview

This application will be used by health care professionals to send "sykmeldinger" to NAV.

## High level decisions

-   This is a monolithic application that will handle users:
    -   Launching the application in a Smart on FHIR context
    -   Uses the application directly using HelseID login (referered to as "standalone")
-   Any asynchronous data loading or actions are using tanstack/query, and **should** have both loading **and** error state.
-   Users sessions are stored in Redis, any action will validate the token using the appropriate issuer.

## Points of interest in the code

### Routes (uses Next "App Dir")

-   FHIR Launch route: [src/app/(fhir)/fhir/launch/page.tsx](<src/app/(fhir)/fhir/launch/page.tsx>)
-   FHIR Form route: [src/app/(fhir)/fhir/page.tsx](<src/app/(fhir)/fhir/page.tsx>)
-   Standalone Form route: [src/app/(standalone)ny/page.tsx](<src/app/(standalone)/ny/page.tsx>)

### The actual form:

The form is built specifically to handle multiple "contexts" without the form having context-specific implementations. This is achieved using a variant of Dependency Injection of the possible data the form can use, using React Context.

-   Root form: [src/components/ny-sykmelding-form/NySykmeldingForm.tsx](src/components/ny-sykmelding-form/NySykmeldingForm.tsx)
-   The data available to the form: [src/components/ny-sykmelding-form/data-provider/NySykmeldingFormDataService.ts](src/components/ny-sykmelding-form/data-provider/NySykmeldingFormDataService.ts)
    -   Form data dependency injection: [src/components/ny-sykmelding-form/data-provider/NySykmeldingFormDataProvider.tsx](src/components/ny-sykmelding-form/data-provider/NySykmeldingFormDataProvider.tsx)
    -   See specific form implementations (form routes above) for usage of this provider

### FHIR mocking for local development (and demo application)

-   FHIR server authentication mocks: [src/app/api/fhir-mock/auth/[[...path]]/route.ts](src/app/api/fhir-mock/auth/%5B%5B...path%5D%5D/route.ts)
-   FHIR server mocks: [src/app/api/fhir-mock/auth/[[...path]]/route.ts](src/app/api/fhir-mock/%5B%5B...path%5D%5D/route.ts)

## Local Development

### Prerequisites

(Use mise? `mise i` to install the required prerequisites)

-   [Node.js](https://nodejs.org/en/) v20 (LTS)
-   [Yarn](https://yarnpkg.com/) (`corepack enable`)

This project relies on a Github PAT with `package:read` available as `NPM_AUTH_TOKEN`-environment variable for
authenticated access to the Github Package Registry.

### Getting Started

Install dependencies:

```bash
yarn
```

(Once): Start Redis docker image locally:

```bash
yarn dev:redis
```

Alternatively, you can edit ``

Start the development server:

```bash
yarn dev
```

### Running e2e tests

Headless:

```bash
yarn test:e2e
```

With interactive Playwright test runner:

```bash
yarn test:e2e --ui
```

If you are developing only e2e tests, you can run it in a special "fast mode" that uses the nextjs production server.

Pre-build the server in a special e2e mode:

```
yarn build:e2e
```

Run the playwright tests using this built server:

```bash
FAST=true yarn test:e2e --ui
```
