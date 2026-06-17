## Context

---

In order to uphold data integrity Nav must be able to verify the data it receives about a practitioner from the electronic healthcare record providers (EHR 🇬🇧 / EPJ 🇳🇴).
Nav has no control of how an EHR provider receives, stores or provides it's data, therefore Nav wishes to use official public data provided by HelseID via Norsk Helsenett (NHN) to enforce this.

All EHR tools used by general practitioners use HelseID login, and therefore Nav wishes to piggyback their information in order to verify data about the practitioner and organization by using a mechanism called token exchange where Nav gets practitioner information from the EHRs HelseID client securely using OAuth 2.1 and OIDC mechanisms.

### Current flow

The Nav sykmelding SMART on FHIR app uses the EHRs FHIR data to obtain information about the practitioners organisation. This information is created, updated and deleted by the EHR, and there is no guarantee that the organisation number is the practitioners physical location.

## Decision

---

HelseID provides information about a logged in healthcare professional. This information is taken from public records, such as Helsepersonellregisteret. This information combined with OAuth 2 and OIDC security provides Nav with the information it needs in order to trust that the person sending a sykmelding is a healthcare professional.

HelseID does NOT provide whether a healthcare professional has the authority to write a sick-leave certificate (sykmelding) as this is an authority given and managed by Nav.

Based on this information, it is decided that Nav will use HelseID SSO to verify the user that is logged in to the EHR system.

## Consequences

---

| Area         | Consequence                                                                                                                                                                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nav          | Nav implements HelseID auth using their own HelseID OAuth client registered in HelseID selvbetjening.                                                                                                                                                         |
| EHR          | No development required.<br><br>The only way to achieve SSO without prompting a login is to use the existing HelseID session that was obtained when the healthcare professional logged in, meaning SSO cannot be completed if the EHR uses an in-app browser. |
| Practitioner | None.<br><br>The application will silently grant access without prompting a login based on the existing browser session.                                                                                                                                      |

## Implementation

---

Prerequisites

1. The EHR system uses HelseID to authenticate their customers

Start to finish

1. Nav creates a HelseID-client in HelseID selvbetjening test
2. Nav registers client secrets in NAIS environment
3.

## Alternatives

---

| Approach             | Rejected because                                                                                                                                                                                                                                                                                                                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HelseID OBO-token    | This method gives Nav more information about the user, but Nav also has to trust the information it receives from the EHR to some degree. The extra information Nav requires should be fetched via FHIR, not via auth.<br><br>Nav still needs to do some OBO-token experiments to verify, but for now this approach is rejected because it requires the EHR to do potentially heavy lifting to existing auth flows. |
| EHR binding contract | Nav cannot maintain contract                                                                                                                                                                                                                                                                                                                                                                                        |

## Q & A

---

## Notes

---

Using this method to obtain information about the practitioners means that this solution must be monitored, with focus on security. This approach MUST not get in the way of existing EHR or practitioner workflows, meaning we must use what we have access to without the EHR needing to intervene or the practitioner needing to do extra work outside their normal workflow.

SMART and HelseID work well for identity, authentication and authorisation, whereas FHIR works well as structured data.

## References

---

[Available HelseID scopes](https://utviklerportal.nhn.no/informasjonstjenester/helseid/bruksmoenstre-og-eksempelkode/bruk-av-helseid/docs/teknisk-referanse/scopes_nb_nomd)
[HelseID token exchange](https://utviklerportal.nhn.no/informasjonstjenester/helseid/bruksmoenstre-og-eksempelkode/bruk-av-helseid/docs/teknisk-referanse/token_exchange_enmd)
