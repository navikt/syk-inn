# Secure implementation of SMART on FHIR launch

## Introduction

> **Note**: This is a simplified version of the SMART launch flow. For detailed technical implementation including security validations, session management, and component details, please refer to [smart-launch.md](smart-launch.md).
>
> Key simplifications in this diagram:
>
> - Security token validation steps are omitted
> - Session management details are abstracted
> - AUTH and FHIR servers are combined
> - NAV components are merged for clarity
>
> These simplifications are made for better readability while the actual implementation follows the security measures detailed in the complete version.

The smarthealthit client library [fhirclient](https://docs.smarthealthit.org/client-js/) provides an implementation for
launching a SMART on FHIR app. While it does provide some mechanisms for server-to-server communication, it's launch
implementation is only client-side, and stores ID-token and access tokens in the browser's local storage.

For this reason, we have implemented a server-side launch mechanism that is compliant with the SMART on FHIR
specification, and stores the metadata and tokens in the server's key-value store.

## Sequence of server side launch (detailed)

```mermaid
---
title: Server side launch
---
sequenceDiagram
    box rgba(49, 96, 181, 0.5) EHR Provider
        actor PAT as Patient (Espen Eksempel)
        actor DOC as Doctor (Grønn Vits)
        participant EHR as EHR system
    end
    box rgba(155, 36, 36, 0.5) Browser
        participant APP_FRONTEND as Smart app
    end
    box rgba(217, 56, 56, 0.5) NAV
        participant APP_SERVER as App server
        participant NAV as NAV app API<br>NAV external services<br>NAV auth server
    end

# Initial EHR login, not relevant for SMART app
    DOC ->> EHR: Login to EHR

# Patient visit
    PAT -->> DOC: Comes in for appointment
    Note over DOC, EHR: 1. Starts consultation for patient<br>2. Selects diagnosis in EHR

# SMART app launch
    DOC ->> EHR: Launch SoF app
    Note over EHR, APP_SERVER: <app>/fhir/launch?iss=https://fhir.ekstern.dev.nav.no<br>&launch=xyz123
    EHR ->> APP_SERVER: Launch request
    Note over APP_SERVER, EHR: <FHIR-server>/<br>.well-known/smart-configuration
    APP_SERVER -->> EHR: Discovery request
    EHR -->> APP_SERVER: Discovery response
    Note over APP_SERVER, EHR: scope: openid profile fhirUser<br>patient/*.urs encounter/*.urs user/*.r<br>metadata: offline_access<br>authorization_endpoint, token_endpoint, keys_endpoint
    APP_SERVER -->> APP_SERVER: Create session
    Note over APP_SERVER: Store: <br>issuer <br>codeVerifier <br>state <br>authorizationEndpoint <br>tokenEndpoint
    APP_SERVER ->> EHR: Authorization URL with redirect_uri
    EHR ->> APP_SERVER: Redirect to redirect_uri with code and state (/fhir/callback)
    APP_SERVER -->> APP_SERVER: Get session
    APP_SERVER -->> EHR: Exchange code for token from token_endpoint
    Note over APP_SERVER, EHR: grant_type: authorization_code<br>code: code param<br>code_verifier: from session
    EHR -->> APP_SERVER: Token response
    Note over EHR, APP_SERVER: Token response: <br>access_token, id_token, encounter, patient
    APP_SERVER -->> APP_SERVER: Update session
    Note over APP_SERVER: Store: <br>id_token <br>access_token <br>patient <br>encounter
    APP_SERVER ->> EHR: Launch complete, 302 redirect: /fhir
    EHR ->> APP_SERVER: Follow redirect (/fhir)

# SMART app use
    APP_SERVER -->> APP_SERVER: Get session
    APP_SERVER -->> EHR: /Practitioner/<session.practitioner>
    EHR -->> APP_SERVER: Practitioner FHIR data
    APP_SERVER ->> APP_FRONTEND: Initializes app with practitioner data
    APP_FRONTEND -->> APP_FRONTEND: Frontend initializes, sets up form and provides interactive elements

# Dynamic form
    par Form pre-loads contextual data
        APP_FRONTEND ->> APP_SERVER: Form: Requests patient data
        APP_SERVER -->> APP_SERVER: Get session
        APP_SERVER -->> EHR: Get patient data
        EHR -->> APP_SERVER: /Patient/<session.patient>
        APP_SERVER ->> APP_FRONTEND: Patient FHIR data
        APP_FRONTEND ->> APP_SERVER: Form: Requests encounter data
        APP_SERVER -->> APP_SERVER: Get session
        APP_SERVER -->> EHR: Get encounter data
        EHR -->> APP_SERVER: /Encounter/<session.encounter>
        APP_SERVER ->> APP_FRONTEND: Encounter FHIR data
    end

    APP_FRONTEND -->> APP_FRONTEND: Form: Initialization is ready

    DOC ->> APP_FRONTEND: Practitioner fills in schema and submits
    APP_FRONTEND ->> APP_SERVER: Submit form
    APP_SERVER -->> APP_SERVER: Get session
    APP_SERVER ->> NAV: Requests machine-token for NAV API
    NAV -->> APP_SERVER: Machine token
    APP_SERVER ->> NAV: /api/sykmelding/submit w/ payload and machine token
    Note over APP_SERVER, NAV: Sykmelding is validated with Nav's rule engine
    NAV ->> NAV: Sykmelding enters normal NAV processing flow
    NAV ->> APP_SERVER: Submit OK
    APP_SERVER ->> EHR: Create DocumentReference for newly created sykmelding
    EHR ->> APP_SERVER: DocumentReference created
    APP_SERVER ->> APP_FRONTEND: Submit OK
    APP_FRONTEND ->> APP_SERVER: Get sykmelding receipt
    APP_SERVER -->> APP_SERVER: Get session
    APP_SERVER ->> NAV: Requests machine-token for NAV API
    NAV -->> APP_SERVER: Machine token
    APP_SERVER ->> NAV: /api/sykmelding/receipt w/ machine token
    NAV -->> APP_SERVER: Sykmelding receipt
    APP_SERVER ->> APP_FRONTEND: Sykmelding receipt
    APP_FRONTEND ->> DOC: Sykmelding receipt
```
