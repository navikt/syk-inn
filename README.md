# syk-inn

## Overview

This application will be used by health care professionals to send "sykmeldinger" to NAV.

## High level decisions

- This is a monolithic application that will handle users:
    - Launching the application in a Smart on FHIR context
    - Uses the application directly using HelseID login (referered to as "standalone")
- Any asynchronous data loading or actions are using tanstack/query, and **should** have both loading **and** error state.
- Users sessions are stored in Valkey, any action will validate the token using the appropriate issuer.

## High level flow

There are two apps, `syk-inn-wonderwall` is a deployed confugiration of [wonderwall](https://github.com/nais/wonderwall)
using HelseID. This acts as a reverse proxy in front of the NextJS app `syk-inn`. Wonderwall will log in any user using
HelseID on all paths except (`/fhir/**`), and add the HelseID access_token as the `Authorization` header to all
requests.

```mermaid
graph TD
    user_standalone["User (standalone)"] --> helseid_routes
    subgraph syk_inn_box ["syk-inn"]
        syk_inn_fhir["syk-inn (fhir)"]
        syk_inn_standalone["syk-inn (standalone)"]
    end

    subgraph external_epj ["Any EPJ"]
       user_epj["User"] --> epj
       epj["EPJ App"]
       fhir["FHIR Server"]
    end

    subgraph wonderwall ["Wonderwall (nav.no/samarbeidspartner/sykmelding)"]
       helseid_routes["/**"]
       fhir_routes["/fhir/**"]
    end

    helseid_routes --> syk_inn_standalone
    helseid_routes <--> helseid["HelseID (NHN)"]
    fhir_routes --> syk_inn_fhir
    epj -- "/fhir/launch?iss=iss&code=code" --> fhir_routes
    syk_inn_fhir -- GET Pasient<br>GET Practitioner <--> fhir
    syk_inn_standalone -- .well-known/connect/userinfo --> helseid
```

## Lingo

Code is written in English. FHIR-resources are referred to as their English names. However, sykmelding domain words
are in Norwegian. So for example, in the data layer where we integrate with FHIR, resources will be referred to as
`Patient` and `Practitioner`, but once mapped into the specific SykmeldingForm, these will be refered to as `Pasient`
and `Behandler`.

In standalone mode, there are no FHIR-resources, so the domain will be refered to in Norwegian, and code still in English.

## Points of interest in the code

### Routes (uses Next "App Dir")

- FHIR Launch route: [src/app/(fhir)/fhir/(fhir-launch)/launch/page.tsx](<src/app/(fhir)/fhir/(fhir-launch)/launch/page.tsx>)
- FHIR Callback route: [src/app/(fhir)/fhir/(fhir-launch)/callback/route.ts](<src/app/(fhir)/fhir/(fhir-launch)/callback/route.ts>)
- FHIR Dashboard: [src/app/(fhir)/fhir/(fhir-launched)/page.tsx](<src/app/(fhir)/fhir/(fhir-launched)/page.tsx>)
- FHIR Sykmelding Form [src/app/(fhir)/fhir/(fhir-launched)/ny/[draftId]/page.tsx](<src/app/(fhir)/fhir/(fhir-launched)/ny/[draftId]/page.tsx>)

### The actual form:

The form is built specifically to handle multiple "contexts" without the form having context-specific implementations. This is achieved using GraphQL, where each each context the application can be "launched" in (FHIR/HelseID) will provide their own implementation of the GraphQL schema, with their corresponding auth.

- Root form: [src/components/ny-sykmelding-form/NySykmeldingForm.tsx](src/components/ny-sykmelding-form/NySykmeldingForm.tsx)
- The data available to the form: [src/data-layer/graphql/schema/root.graphqls](src/data-layer/graphql/schema/root.graphqls)

## Local Development

### Prerequisites

(Use mise? `mise i` to install the required prerequisites)

- [Node.js](https://nodejs.org/en/) v22 (LTS)
- [Yarn](https://yarnpkg.com/) (`corepack enable`)
- [Docker](https://www.docker.com/)

This project relies on a Github PAT with `package:read` available as `NPM_AUTH_TOKEN`-environment variable for
authenticated access to the Github Package Registry.

### Getting Started

Install dependencies:

```bash
yarn
```

Start the development server (automatically starts Valkey, this is why Docker is needed):

```bash
yarn dev
```

You can run the development server with the syk-inn-api server on port 8080 by enabling the environment
variable USE_LOCAL_SYK_INN_API in .env.development.

See the README for syk-inn-api on how to run it using bootRun or IntelliJ.

### Running e2e tests

Headless:

```bash
yarn e2e
```

With interactive Playwright test runner:

```bash
yarn e2e:dev
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
