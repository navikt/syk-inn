# ADR02 - SMART on FHIR secured by HelseID

TOC

- [Context](#context)
- [Decision](#decision)

## Context

Nav intends to verify the identity and authorization of the general practitioner who issues the sick leave certificate for the patient. To achieve this, Nav has decided to use HelseID to secure the SMART on FHIR flow with a trusted third-party. To ensure a secure authentication and authorization procedure, Nav has considered multiple options for how to achieve this in the best possible way. Out of the two best candidates we considered, the first one being double authentication by triggering a new login though single-sign-on (SSO) when the practitioner submits the sick leave certificate form. The second option is to exchange the user's HelseID access token for an access token with reduced privileges.

## Decision

The decision was made to approve the second alternative where we will exchange the user's token for a new token with reduced privileges to achieve zero-trust between the parties and to avoid having two active login sessions simultaneously. The user would log in as usual and during the SMART on FHIR launch the EHR-provider will add extra claims that will be used when authenticating and authorizing the user against HelseID. The SMART on FHIR application will be registered as a client (API-provider) in HelseID with a set of scopes to control authorization; the EHR will consume this API.

## Consequences

## Alternatives ?

oppsummering

litt details
teikning
