# Onboarding a new EHR (EPJ) vendor to the old flow (ebXML via emottak), part 1

> [!WARNING]
>
> This flow is deprecated and will be turned off in 2028.
>
> Use SMART on FHIR as the preferred method of exchanging data with Nav. See
> [`docs/smart/getting-started.md`](../../smart/getting-started.md).

This is part 1 of 2. Part 1 covers everything that happens before you can exchange messages, from
first contact to a working CPA (Collaboration Protocol Agreement). Part 2 covers the actual message
implementation and is documented separately once part 1 is done.

## Before you build the CPP

You need all the following in place before building and sending your CPP.

1. Membership and connectivity with Norsk Helsenett (NHN).
2. A PKI solution that provides one certificate for signing and one certificate for encryption. The
   old CPP/CPA flow requires X.509 certificates, encoded as base64 in the CPP. Confirm with Nav or
   NHN which certificate solution is accepted for new integrations. Preferred method is signing with
   HelseID.
3. A HER-id registered in Adresseregisteret (AR).
4. An EDI address on the form `mailto://din-adresse@edi.nhn.no`.

## Step 1: contact Nav before creating the CPP

Send an email to `e-mottak@nav.no` to announce that you want to start sending sykmelding over ebXML.
Nav replies with an explanation of CPP and CPA and points you to the technical specifications listed
at the bottom of this page.

Do not expect the CPA at this stage. The CPP must exist before the CPA can be created. The 2013 CPP
Guide says that the local actor creates a CPP first, then the central actor creates the CPA from
that CPP and its own CPP. The current e-mottak team creates the CPA.

The 2028 shutdown date is current onboarding information. It is not described in the 2013 CPP Guide.

## Step 2: understand CPP and CPA

**CPP (Collaboration Protocol Profile)** is an XML document that describes what your system is
capable of. It lists your identity (HER-id), which processes you support (for example sykmelding),
which message versions you can send and receive, your roles, your routing information, your
communication channel and protocol, and your certificates.

**CPA (Collaboration Protocol Agreement)** is an XML document that describes the actual message
exchange between two specific parties. A CPA is the intersection of your CPP and Nav's CPP. Nav
creates the CPA, not you.

## Step 3: build your CPP

Start from Nav's template, `EM02010105 030 CPP_Legekontor_mal.xml` (linked below). Edit it in two
ways. Replace the placeholder values, and remove the processes you do not support.

### Replace the placeholder values

| Placeholder            | XPath                                                                                                                                                | What to put there                                               |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `UNIKCPPID`            | `/tns:CollaborationProtocolProfile/@tns:cppid`                                                                                                       | An id unique to you as the CPP owner                            |
| `HERID`                | `/tns:CollaborationProtocolProfile/tns:PartyInfo/tns:PartyId[@tns:type='HER']/text()`                                                                | Your HER-id                                                     |
| `PARTYNAME`            | `/tns:CollaborationProtocolProfile/tns:PartyInfo/@tns:partyName`                                                                                     | A human readable short name for your organisation               |
| `EPOSTADRESSE`         | `/tns:CollaborationProtocolProfile/tns:PartyInfo/tns:Transport/tns:TransportReceiver[tns:TransportProtocol[.='SMTP']]/tns:Endpoint/@tns:uri`         | Your EDI address, on the form `mailto://din-adresse@edi.nhn.no` |
| `NONREPSERTIFIKATIB64` | `/tns:CollaborationProtocolProfile/tns:PartyInfo/tns:Certificate[@tns:certId='default_sign_cert']/ds:KeyInfo/ds:X509Data/ds:X509Certificate/text()`  | Your signing certificate, base64 encoded                        |
| `CONFIDSERTIFIKATIB64` | `/tns:CollaborationProtocolProfile/tns:PartyInfo/tns:Certificate[@tns:certId='default_crypt_cert']/ds:KeyInfo/ds:X509Data/ds:X509Certificate/text()` | Your encryption certificate, base64 encoded                     |

The template assumes exactly one email address, one signing certificate and one encryption
certificate per party. Do not add more. An HelseID token is not automatically a replacement for the
X.509 certificate fields in this old CPP format.

### Remove processes you do not support

The template lists every process a legekontor could support, wrapped in `CollaborationRole`
elements. Find the process name for each `CollaborationRole` with this XPath:

```
/tns:CollaborationProtocolProfile/tns:PartyInfo/tns:CollaborationRole/tns:ProcessSpecification/@tns:name
```

Remove every `CollaborationRole` for a process you do not support. The processes relevant to
sykmelding are:

| Process name  | Description                                                                                                                                                                   |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Legemelding` | Existing process for exchanging sykmelding, legeerklæring and AppRec with Nav                                                                                                 |
| `Sykmelding`  | Extended sykmelding process, covers `Sykmelde`, `HenvendelseFraLege`, `HenvendelseFraSaksbehandler`, `ForesporselFraSaksbehandler`, `Oppfolgingsplan`, `DialogmoteInnkalling` |

The template also contains processes unrelated to sykmelding (`BehandlerKrav`, `Egenandel`,
`Pasientliste`, `Fastlege`, eResept). Remove any of these you do not support as well.

When you remove a `CollaborationRole`, also remove the `Packaging` and `SimplePart` elements it
referenced, if they are not used by any remaining `CollaborationRole`.

### Keep only the message versions you support

The template also lists every version of every message. List the namespaces actually registered in
your CPP with:

```
/tns:CollaborationProtocolProfile/tns:SimplePart/tns:NamespaceSupported/@tns:location
```

Keep only the newest version you support for each message type, then remove the `SimplePart`
elements for the versions you dropped. Also remove any `Constituent` element that referenced a
removed `SimplePart`, and any `Composite` element that only contained that `Constituent`.

The ebXML 2.0 SOAP header namespace must always stay, regardless of which message versions you
support:

```
http://www.oasis-open.org/committees/ebXML-msg/schema/msg-header-2_0.xsd
```

## Step 4: send the CPP where e-mottak instructs

The 2013 CPP Guide says to send your CPP to **NHN Adresseregisteret (AR)**. AR stores your CPP,
publishes it, and forwards it to central actors. The guide does not mention `e-mottak@nav.no`.

The current e-mottak process is not described in the guide or on the current Nav technical
specifications page. Ask the e-mottak team where they want the completed CPP sent. Do not assume
that the CPP goes to NHN or to `e-mottak@nav.no` without their instruction.

If e-mottak instructs you to use the NHN process, send the signed CPP as an email attachment to one
of these addresses, depending on environment:

| Environment | Address                |
| ----------- | ---------------------- |
| Production  | `cpp@edi.nhn.no`       |
| QA          | `cpp-qa@edi.nhn.no`    |
| Test 1      | `cpp-test1@edi.nhn.no` |
| Test 2      | `cpp-test2@edi.nhn.no` |
| Test 3      | `cpp-test3@edi.nhn.no` |
| Test 4      | `cpp-test4@edi.nhn.no` |

If e-mottak instructs you to use the NHN process, register your CPP in a test environment first and
confirm you get a CPA back before you send anything to production.

For the NHN process, the email must follow these rules exactly:

1. The subject line must be `CPP`, or `CPPTEST` while testing.
2. The email body must be empty.
3. The CPP must be the only attachment.
4. The CPP must be valid XML, UTF-8 encoded, and follow the OASIS ebXML CPP specification
   (Collaboration-Protocol Profile and Agreement Specification Version 2.0).

There are two failure modes:

- If the CPP content itself is invalid (not valid ebXML, or not UTF-8), you get a reply saying the
  content was rejected.
- If the email itself does not follow the four rules above (wrong subject, non-empty body, more than
  one attachment), the email is **deleted silently**. You get no reply at all. If you sent a CPP and
  heard nothing back, check your email against the four rules first.

## Step 5: e-mottak creates and returns the CPA

After e-mottak receives or otherwise obtains your CPP, the e-mottak team creates the CPA from your
CPP and Nav's CPP, then sends the CPA back to you. If Nav already had an older CPA with you, that
older CPA is not deleted, its expiry date (`End` element) is set so it stops being valid.

## Step 6: apply the CPA

The CPA you receive contains everything needed to send and receive messages. The parts you need are:

- **`cpaid`**: a unique id for this CPA. Use this value as `CPAId` in the ebXML MessageHeader of
  every message you send.
- **`Start` and `End`**: the validity period. If `Start` is in the past or now, the CPA is usable
  immediately. If `Start` is in the future, you can read the CPA now but must not use it before that
  date. You must stop using the CPA once `End` has passed.
- **`PartyId`**, **`Role`**, **`Service`**, **`Action`**: these values go into the ebXML envelope of
  every message you send.
- **`partyName`** and **`Endpoint`**: these do not go into the ebXML envelope. `partyName` is only a
  human readable label. `Endpoint` tells you where to deliver the message (an email address or an
  HTTPS address), it is not part of the message content.
- **Certificate**: use only the certificate specified in the CPA for signing and encryption, even if
  you have other valid certificates available.

Once you have applied the CPA to your system, part 1 is done.

## What part 1 does not cover

Part 1 ends with a working CPA. Building and sending the actual sykmelding messages, message
versions, packaging, and error handling for message exchange is part 2, documented separately.

## Reference documents

- [Digital sykmelding og dialogmeldinger, tekniske spesifikasjoner](https://www.nav.no/samarbeidspartner/digital-sykmelding-og-dialogmeldinger-tekniske-spesifikasjoner)
  (the Nav page listing all documents below)
- [CPP Guide fra Nav (EM02010102.220), version 2.2, 2013](https://www.nav.no/_/attachment/download/b500f73f-7a79-4c0d-bf97-8b1f4fbb4166:88bed4f57207a832aa8706c4a28fe036946e6922/em02010102.220-cpp-guide.pdf),
  the source for this page
- [CPP-mal legekontor (EM02010105 030)](https://www.nav.no/_/attachment/download/90857066-00e6-4c21-864b-40414bf57538:2eb3af9da8934ea68aa0c116cce1336d23738b30/em02010105-030-cpp-legekontor-mal.xml),
  the CPP template referenced in step 3
- [Arkitekturdokument for bruk av CPP og CPA (EM0434003 100)](https://www.nav.no/_/attachment/download/73a4e99b-189e-4e7e-b2f2-cf1c83327ac9:968ae60ebf71be6521d06b2686f9a2935988236e/em0434003-100-arkitekturdokument-for-bruk-av-cpp-og-cpa.pdf)
- [IS-2096 CPP-CPA partnerprofiler og avtaler](https://www.nav.no/_/attachment/download/33f2bc2f-496b-4bb2-a54b-accf0d97d851:b47b3b4b5740def9e91c0cd2795c872dd4196d3c/is-2175-cpp-cpa-partnerprofiler-og-avtaler.pdf)
