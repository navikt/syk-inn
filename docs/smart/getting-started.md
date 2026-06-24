# Getting started with SMART on FHIR

This guide is for EPJ-leverandører who want Nav's sykmelding app to launch inside their EPJ.
We assume you already run an **authorization server** (OAuth2 / OpenID Connect) and can
expose a **FHIR R4** API for the patient in context. With those two things, the rest is
registration and a bit of configuration on both sides. The guide links to the
[HL7 SMART specification](https://hl7.org/fhir/smart-app-launch/) for details and to Nav's
own resources where relevant.

> **What is SMART on FHIR?** It is a standard way to launch an external web app (here, Nav's
> sykmelding app) from inside your EPJ. When a doctor opens it, your authorization server
> hands the app a short-lived, limited access token, and the app reads and writes patient
> data through your **FHIR R4** API. If you already know FHIR and run an OAuth2 / OpenID
> Connect authorization server, the rest is mostly registration and configuration. Your FHIR
> server only needs to serve the handful of [resources Nav uses](../fhir/_oversikt.md).

## TL;DR

What you set up, in order:

1. **Serve a FHIR R4 server** with the handful of resources Nav reads and writes (Step 1).
2. **Expose `.well-known/smart-configuration`** so SMART can discover your endpoints (Step 2).
3. **Register Nav's app** (`syk-inn`) as a client in your authorization server (Step 3).
4. **Tell Nav your issuer (`iss`)** and client-auth type so we recognise your EPJ (Step 4).
5. **Launch the app** from your EPJ with `iss` and a `launch` parameter (Step 5).

At launch time: the doctor opens Nav's app from your EPJ, your authorization server
authenticates and returns a scoped access token plus patient context, and the app then reads
and writes through your FHIR API.

For the full launch sequence, see the
[simplified launch diagram](./smart-launch-simplified.md) and the
[detailed, security-annotated version](./smart-launch.md).

## Step 1: Simple FHIR server

You do not need a complete FHIR implementation to start. Nav reads a small set of
**FHIR R4** resources and writes a journal document reference back.

**Read (for forhåndsutfylling of the sykmelding):**

| Resource                                  | Why Nav needs it                                               | Profile / docs        |
| ----------------------------------------- | -------------------------------------------------------------- | --------------------- |
| [`Patient`](../fhir/patient.md)           | Identify the patient (fødselsnummer/d-nummer) and show name    | no-basis-Patient      |
| [`Practitioner`](../fhir/practitioner.md) | Identify the signing helsepersonell (HPR-nummer)               | no-basis-Practitioner |
| [`Encounter`](../fhir/encounter.md)       | Consultation context (kontakttype)                             | Encounter             |
| [`Condition`](../fhir/condition.md)       | Pre-fill diagnosis (ICD-10 / ICPC-2), optional but recommended | Condition             |
| [`Organization`](../fhir/organization.md) | Identify the helsevirksomhet (organisasjonsnummer)             | no-basis-Organization |

**Write (for tilbakeskriving of the sykmelding PDF):**

| Resource                                                          | Why Nav needs it                                                                                       | Docs                       |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------- |
| [`DocumentReference`](../fhir/document-reference.md) (+ `Binary`) | Represent the sykmelding PDF in the journal. The PDF can be embedded or stored separately as `Binary`. | DocumentReference / Binary |

Two requirements matter here:

- **FHIR version R4** is required.
- Norwegian **kodeverk** (OID-based code systems: ICD-10, ICPC-2, HPR, etc.) must be used.
  See Nav's [krav and OID table](../fhir/nav-requirements.md#kodeverk).

Everything else can come later, such as QuestionnaireResponse and Bundle.

## Step 2: Expose `.well-known/smart-configuration`

SMART clients discover your endpoints (authorization, token, JWKS, supported scopes) from a
discovery document, which is a JSON file at a fixed URL under your FHIR base:

```
<your-fhir-base>/.well-known/smart-configuration
```

References:

- HL7: [Conformance: using `.well-known/smart-configuration`](https://hl7.org/fhir/smart-app-launch/conformance.html#using-well-known)
- HL7: [Discovery request](https://hl7.org/fhir/smart-app-launch/app-launch.html#step-3-discovery)
- HL7: [Scopes and launch context](https://hl7.org/fhir/smart-app-launch/scopes-and-launch-context.html)

> Nav **requires** this endpoint to be reachable from Nav's infrastructure. Both the FHIR
> server and the authorization server must be reachable from Nav. See
> [nav-requirements.md](../fhir/nav-requirements.md).

## Step 3: Register Nav's app as a client in your EPJ

Register `syk-inn` as a SMART client in your authorization server using these current
**test/dev** values:

| Field                             | Value                                                                                                                                                                             |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `clientId`                        | `syk-inn`                                                                                                                                                                         |
| `launchUrl`                       | `https://www.ekstern.dev.nav.no/samarbeidspartner/sykmelding/fhir/launch`                                                                                                         |
| SMART redirect URI / callback URL | `https://www.ekstern.dev.nav.no/samarbeidspartner/sykmelding/fhir/callback`                                                                                                       |
| `scopes`                          | `openid profile launch fhirUser offline_access patient/Patient.read patient/Encounter.read patient/Condition.read patient/DocumentReference.read patient/DocumentReference.write` |

> The `patient/*` scopes cover the patient-context resources. The signing `Practitioner` is
> resolved via the `fhirUser` scope (from the ID-token). Other resources Nav needs must be
> reachable through your authorization model. For example, Nav resolves `Organization/<id>`
> from `Encounter.serviceProvider`, so make sure referenced `Organization` resources are
> available under the granted context. Treat
> [Nav's FHIR overview](../fhir/_oversikt.md) as the source of truth for _which data_ Nav
> needs, and this table as the concrete dev/test client registration.

See HL7: [Register App with EHR](https://hl7.org/fhir/smart-app-launch/app-launch.html#step-1-register).

## Step 4: Tell Nav your issuer (`iss`) and pick a client-auth type

Nav needs to know which **issuer** (`iss`) you launch with, so we recognise your EPJ as a
known FHIR server. On Nav's side this is a single entry, for example:

```ts
{
  name: 'EPJ (test)',
  issuer: '<your FHIR base URL / iss>',
  type: 'confidential-symmetric',
  method: 'client_secret_basic',
  clientSecret: '<shared secret>',
}
```

Real EPJ integrations use a **confidential-symmetric** client (a shared client secret) in
both dev and prod. This is what Nav expects for an onboarding EPJ. A **public** client (no
client authentication) is only used for local development and sandbox testing (for example
the SMART Health IT sandbox or a local NAV EPJ server).

Nav's app currently supports these two client authentication types:

| Type                     | What it means                                     | When to use                                        |
| ------------------------ | ------------------------------------------------- | -------------------------------------------------- |
| `confidential-symmetric` | Shared client secret (e.g. `client_secret_basic`) | Real EPJ integrations (Nav's dev and prod default) |
| `public`                 | No client secret                                  | Local development / sandbox testing only           |

> **`confidential-asymmetric` (signed JWT client assertion / `private_key_jwt`) is not yet
> supported.** It is on the roadmap; if you need asymmetric client auth, coordinate with Nav
> before onboarding.

Nav's known-server config in code:
[`issuers/envs/dev-gcp.ts`](../../src/core/data-layer/fhir/smart/issuers/envs/dev-gcp.ts)
and [`issuers/envs/prod-gcp.ts`](../../src/core/data-layer/fhir/smart/issuers/envs/prod-gcp.ts)
(real EPJ, `confidential-symmetric`), and
[`issuers/envs/others.ts`](../../src/core/data-layer/fhir/smart/issuers/envs/others.ts)
(local/sandbox examples for both `public` and `confidential-symmetric`).

> To onboard a test EPJ, give Nav your `iss` and preferred client-auth type so we can add
> you as a known EPJ in our test environment.

## Step 5: Launch the app

Launch is a standard EHR launch: your EPJ opens the app's launch URL with two query
parameters. `iss` is your FHIR base URL, so the app knows which EPJ launched it, and
`launch` is an opaque, one-time id the app passes back to your authorization server to
retrieve the patient context.

```
<app>/fhir/launch?iss=<your-fhir-base>&launch=<opaque-id>
```

For Nav's test environment:

```
https://www.ekstern.dev.nav.no/samarbeidspartner/sykmelding/fhir/launch?iss=<your-fhir-base>&launch=<opaque-id>
```

How you embed the app (new tab vs. iframe) is up to you. For iframes, note that modern
setups rely on `Content-Security-Policy: frame-ancestors` rather than the deprecated
`X-Frame-Options`, and cookie partitioning
([CHIPS](https://developer.mozilla.org/en-US/docs/Web/Privacy/Guides/Third-party_cookies/Partitioned_cookies))
may be relevant. Nav is still refining this, so reach out if you integrate via iframe.

## Running the app locally (optional)

Nav's app is ready to launch in Nav's test environment, so you do not need to run it
locally. If you still want to:

- Nav publishes internal `@navikt/*` packages to the GitHub Package Registry, which does not
  allow anonymous pulls. Create a **classic** GitHub Personal Access Token (not
  fine-grained) with the `read:packages` scope, then:

  ```sh
  NPM_AUTH_TOKEN=$YOUR_PAT yarn install
  ```

  These packages are not confidential; the registry just requires authentication. See
  [About permissions for GitHub Packages](https://docs.github.com/en/packages/learn-github-packages/about-permissions-for-github-packages).

- Add your local EPJ issuer to `getLocalKnownFhirServers` in
  [`issuers/envs/others.ts`](../../src/core/data-layer/fhir/smart/issuers/envs/others.ts).

- Local launch URL:

  ```
  http://localhost:3000/fhir/launch?iss=http://localhost:8080/my-EPJ-fhir-server&launch=<opaque-id>
  ```

## Validate your implementation

Nav provides a validator you can run against your SMART/FHIR implementation:
[navikt/smart-on-fhir-validator](https://github.com/navikt/smart-on-fhir-validator).

NB! This is under active development!

## Nav's requirements (krav)

A summary; see the full list in [nav-requirements.md](../fhir/nav-requirements.md):

- **FHIR R4** resources, using Norwegian **kodeverk** (OID-based code systems).
- SMART implementation conformant with the
  **SMART App Launch Implementation Guide (v2.2.0 / STU 2.2)**.
- Open, reachable `.well-known/smart-configuration` endpoint.
- A **test environment** Nav (and test-leger) can use, ideally with synthetic data from
  SyntPop.

## Upcoming events

- **Norwegian FHIR Hackathon 2026**, 9 November 2026. A good chance to test SMART on FHIR
  integrations in person.
  <https://hl7norway.github.io/Norwegian-FHIR-Hackathon-2026/currentbuild/index.html>
- HL7 International runs regular **FHIR Connectathons** with SMART App Launch tracks. See the
  [HL7 events calendar](https://www.hl7.org/events/) and
  [FHIR Connectathon page](https://www.hl7.org/events/fhir-connectathon/).

## Reference links

**HL7 International, SMART App Launch IG (the authoritative spec):**

- [SMART App Launch overview](https://hl7.org/fhir/smart-app-launch/app-launch.html)
- [Scopes and launch context](https://hl7.org/fhir/smart-app-launch/scopes-and-launch-context.html)
- [Conformance](https://hl7.org/fhir/smart-app-launch/conformance.html)
- [HL7 FHIR R4 resource list](https://hl7.org/fhir/R4/resourcelist.html)

**Norwegian context:**

- [OID-identifikatorserier i helse- og omsorgstjenesten (Helsedirektoratet)](https://www.helsedirektoratet.no/digitalisering-og-e-helse/e-helsestandarder-og-standardiseringstiltak/oid-identifikatorserier-i-helse-og-omsorgstjenesten#nasjonale-identifikatorserier-for-personer)

**Nav resources:**

- [Nav's FHIR resource overview](../fhir/_oversikt.md)
- [Nav's krav til helsevirksomheter og EPJ-leverandører](../fhir/nav-requirements.md)
- [syk-inn (source)](https://github.com/navikt/syk-inn)
- [smart-on-fhir-validator](https://github.com/navikt/smart-on-fhir-validator)
