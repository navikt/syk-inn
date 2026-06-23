# e2e

Workspace for end-to-end tests for the project.

Run the tests from root using `yarn e2e:dev` or `yarn e2e`.

# Current test suite:

<!-- TESTS:START -->

## [fhir/dashboard/drafts.spec.ts](./fhir/dashboard/drafts.spec.ts)

- [quickly delete a lot of drafts](./fhir/dashboard/drafts.spec.ts#L18)
- [open and edit a draft from the dashboard](./fhir/dashboard/drafts.spec.ts#L38)
- [save and continue editing a behandlingsdager draft](./fhir/dashboard/drafts.spec.ts#L64)

## [fhir/dashboard/dupliser.spec.ts](./fhir/dashboard/dupliser.spec.ts)

- [should be able to dupliser (from dashboard) an existing sykmelding with correct values](./fhir/dashboard/dupliser.spec.ts#L37)
- [should be able to dupliser behandlingsdager (from dashboard) @feature-toggle](./fhir/dashboard/dupliser.spec.ts#L86)
- [should be able to dupliser (from dashboard) an existing sykmelding, go to summary, and return to form without losing values](./fhir/dashboard/dupliser.spec.ts#L130)
- [should not be possible to dupliser (from dashboard) old sykmelding](./fhir/dashboard/dupliser.spec.ts#L176)

## [fhir/dashboard/forleng.spec.ts](./fhir/dashboard/forleng.spec.ts)

- [should be able to forlenge an existing sykmelding with correct values](./fhir/dashboard/forleng.spec.ts#L37)
- [should be able to forlenge an existing behandlingsdager-sykmelding with correct values @feature-toggle](./fhir/dashboard/forleng.spec.ts#L87)
- [should be able to forleng a sykmelding, go to summary, and return to form without losing values](./fhir/dashboard/forleng.spec.ts#L138)

## [fhir/dashboard/redacted.spec.ts](./fhir/dashboard/redacted.spec.ts)

- [redacted @feature-toggle should see other users sykmeldinger as redacted versions](./fhir/dashboard/redacted.spec.ts#L6)
- [redacted @feature-toggle toggled off - should not display any other sykmeldinger](./fhir/dashboard/redacted.spec.ts#L30)

## [fhir/dashboard/sykmelding.spec.ts](./fhir/dashboard/sykmelding.spec.ts)

- [should be able to view previous sykmelding](./fhir/dashboard/sykmelding.spec.ts#L21)
- [previous sykmelding within 4 days should still show as a full sykmelding](./fhir/dashboard/sykmelding.spec.ts#L42)
- [previous sykmelding older than 4 days should display less values](./fhir/dashboard/sykmelding.spec.ts#L63)
- [sykmelding with multiple periods should show full period in link and all other periods in helptext](./fhir/dashboard/sykmelding.spec.ts#L87)

## [fhir/fhir-behandlingsdager.spec.ts](./fhir/fhir-behandlingsdager.spec.ts)

- [simple full behandlingsdager sykmelding @feature-toggle ](./fhir/fhir-behandlingsdager.spec.ts#L21)

## [fhir/fhir-bruksvilkar.spec.ts](./fhir/fhir-bruksvilkar.spec.ts)

- [when bruksvilkår toggle is on, user should be automatically redirected to bruksvilkår page](./fhir/fhir-bruksvilkar.spec.ts#L5)
- [accepting the bruksvilkår should allow you to return to the patient](./fhir/fhir-bruksvilkar.spec.ts#L17)

## [fhir/fhir-chaosmonkey.spec.ts](./fhir/fhir-chaosmonkey.spec.ts)

- [spamming 'Send'-button repeatedly should only submit 1 sykmelding](./fhir/fhir-chaosmonkey.spec.ts#L10)

## [fhir/fhir-feedback.spec.ts](./fhir/fhir-feedback.spec.ts)

- [submitting feedback should work](./fhir/fhir-feedback.spec.ts#L12)
- [submitting feedback without contact should work](./fhir/fhir-feedback.spec.ts#L25)
- [submitting feedback on kvittering page should work](./fhir/fhir-feedback.spec.ts#L38)

## [fhir/fhir-form-interactions.spec.ts](./fhir/fhir-form-interactions.spec.ts)

## ['shorthand' date interactions](./fhir/fhir-form-interactions.spec.ts)

- [when using shorthand on a forlenget sykmelding, the shorhand should be from the start of the forlengelse](./fhir/fhir-form-interactions.spec.ts#L14)
- [when using shorthand on a forlenget sykmelding in the tom field, the shorhand should be from the start of the forlengelse if fom is empty](./fhir/fhir-form-interactions.spec.ts#L37)

## [fhir/fhir-form-rule-validations.spec.ts](./fhir/fhir-form-rule-validations.spec.ts)

- [UGYLDIG_ORGNR_LENGDE](./fhir/fhir-form-rule-validations.spec.ts#L8)

## [fhir/fhir-form-submit.spec.ts](./fhir/fhir-form-submit.spec.ts)

- [submit with only default values and prefilled FHIR values](./fhir/fhir-form-submit.spec.ts#L27)
- [should be able to submit purely with shortcuts](./fhir/fhir-form-submit.spec.ts#L63)
- [should pre-fill bidiagnoser from FHIR](./fhir/fhir-form-submit.spec.ts#L98)
  ## [Resetting diagnoser when prefilled from FHIR](./fhir/fhir-form-submit.spec.ts)
  - [adding extra diagnose and resetting them should remove them](./fhir/fhir-form-submit.spec.ts#L140)
  - [removing diagonses from FHIR prefill and reseetting them should add them back](./fhir/fhir-form-submit.spec.ts#L172)

## [fhir/fhir-launch.spec.ts](./fhir/fhir-launch.spec.ts)

- [launching with an unknown issuer should not work](./fhir/fhir-launch.spec.ts#L5)

## [fhir/fhir-multi-user.spec.ts](./fhir/fhir-multi-user.spec.ts)

- [launching twice independently in same browser, but different tabs, should work](./fhir/fhir-multi-user.spec.ts#L15)
- [launching and opening a link in a new tab, should persist context and work with future launches](./fhir/fhir-multi-user.spec.ts#L43)
- [edge case: launching a second sessiond, returning to first one and opening a link in a new tab fails](./fhir/fhir-multi-user.spec.ts#L77)

## [multi-mode/dupliser.spec.ts](./multi-mode/dupliser.spec.ts)

- [FHIR: should be able to duplicate from kvittering](./multi-mode/dupliser.spec.ts#L19)
- [Standalone: should be able to duplicate from kvittering](./multi-mode/dupliser.spec.ts#L19)

## [multi-mode/form-aareg.spec.ts](./multi-mode/form-aareg.spec.ts)

- [FHIR: aareg @feature-toggle - should be able to fill arbeidsforhold with AAREG data](./multi-mode/form-aareg.spec.ts#L24)
- [FHIR: aareg @feature-toggle - going to summary and returning should keep arbeidsgiver in Select](./multi-mode/form-aareg.spec.ts#L66)
- [FHIR: aareg @feature-toggle - saving a draft and returning should keep arbeidsgiver in Select](./multi-mode/form-aareg.spec.ts#L107)
- [Standalone: aareg @feature-toggle - should be able to fill arbeidsforhold with AAREG data](./multi-mode/form-aareg.spec.ts#L24)
- [Standalone: aareg @feature-toggle - going to summary and returning should keep arbeidsgiver in Select](./multi-mode/form-aareg.spec.ts#L66)
- [Standalone: aareg @feature-toggle - saving a draft and returning should keep arbeidsgiver in Select](./multi-mode/form-aareg.spec.ts#L107)

## [multi-mode/form-annen-fravarsgrunn.spec.ts](./multi-mode/form-annen-fravarsgrunn.spec.ts)

- [FHIR: Submit sykmelding with annen lovfestet fraværsgrunn](./multi-mode/form-annen-fravarsgrunn.spec.ts#L19)
- [FHIR: When ticking the checkbox the reason should be required](./multi-mode/form-annen-fravarsgrunn.spec.ts#L50)
- [Standalone: Submit sykmelding with annen lovfestet fraværsgrunn](./multi-mode/form-annen-fravarsgrunn.spec.ts#L19)
- [Standalone: When ticking the checkbox the reason should be required](./multi-mode/form-annen-fravarsgrunn.spec.ts#L50)

## [multi-mode/form-interactions.spec.ts](./multi-mode/form-interactions.spec.ts)

- [FHIR: hoveddiagnose - shall be able to edit diagnose](./multi-mode/form-interactions.spec.ts#L18)
- [FHIR: bidiagnoser - adding, editing, deleting adhd test](./multi-mode/form-interactions.spec.ts#L34)
- [Standalone: hoveddiagnose - shall be able to edit diagnose](./multi-mode/form-interactions.spec.ts#L18)
- [Standalone: bidiagnoser - adding, editing, deleting adhd test](./multi-mode/form-interactions.spec.ts#L34)
  ## [FHIR: 'shorthand' date interactions](./multi-mode/form-interactions.spec.ts)
  - [FHIR: when using shorthand on n+1 period, the shorhand should be from the tom+1 of the previous period](./multi-mode/form-interactions.spec.ts#L70)
  - [FHIR: when using shorthand on n+1 period, should handle tom shorthands](./multi-mode/form-interactions.spec.ts#L100)
  - [FHIR: misc interactions through fom-field](./multi-mode/form-interactions.spec.ts#L128)
  - [FHIR: misc interactions through tom-field](./multi-mode/form-interactions.spec.ts#L154)
  - [FHIR: should display popover with hint for fom field](./multi-mode/form-interactions.spec.ts#L194)
  - [FHIR: should display popover with hint for tom field](./multi-mode/form-interactions.spec.ts#L207)
  ## [Standalone: 'shorthand' date interactions](./multi-mode/form-interactions.spec.ts)
  - [Standalone: when using shorthand on n+1 period, the shorhand should be from the tom+1 of the previous period](./multi-mode/form-interactions.spec.ts#L70)
  - [Standalone: when using shorthand on n+1 period, should handle tom shorthands](./multi-mode/form-interactions.spec.ts#L100)
  - [Standalone: misc interactions through fom-field](./multi-mode/form-interactions.spec.ts#L128)
  - [Standalone: misc interactions through tom-field](./multi-mode/form-interactions.spec.ts#L154)
  - [Standalone: should display popover with hint for fom field](./multi-mode/form-interactions.spec.ts#L194)
  - [Standalone: should display popover with hint for tom field](./multi-mode/form-interactions.spec.ts#L207)

## [multi-mode/form-persistence.spec.ts](./multi-mode/form-persistence.spec.ts)

- [FHIR: filling out the form, and returning to main step, should keep all values](./multi-mode/form-persistence.spec.ts#L71)
- [FHIR: filling out the form, saving a draft, and returning to the form, should keep all the values](./multi-mode/form-persistence.spec.ts#L85)
- [FHIR: filling out the form, and reloading on kvittering page should restore values](./multi-mode/form-persistence.spec.ts#L121)
- [Standalone: filling out the form, and returning to main step, should keep all values](./multi-mode/form-persistence.spec.ts#L71)
- [Standalone: filling out the form, saving a draft, and returning to the form, should keep all the values](./multi-mode/form-persistence.spec.ts#L85)
- [Standalone: filling out the form, and reloading on kvittering page should restore values](./multi-mode/form-persistence.spec.ts#L121)

## [multi-mode/form-rule-validations.spec.ts](./multi-mode/form-rule-validations.spec.ts)

- [FHIR: "Periode"-rules](./multi-mode/form-rule-validations.spec.ts#L49)
- [FHIR: "Time in relation to now"-rules](./multi-mode/form-rule-validations.spec.ts#L106)
- ⚠️ [FHIR: UGYLDIG_KODEVERK_FOR_HOVEDDIAGNOSE, UGYLDIG_KODEVERK_FOR_BIDIAGNOSE](./multi-mode/form-rule-validations.spec.ts#L140)
- [Standalone: "Periode"-rules](./multi-mode/form-rule-validations.spec.ts#L49)
- [Standalone: "Time in relation to now"-rules](./multi-mode/form-rule-validations.spec.ts#L106)
- ⚠️ [Standalone: UGYLDIG_KODEVERK_FOR_HOVEDDIAGNOSE, UGYLDIG_KODEVERK_FOR_BIDIAGNOSE](./multi-mode/form-rule-validations.spec.ts#L140)

## [multi-mode/form-submit.spec.ts](./multi-mode/form-submit.spec.ts)

- [FHIR: simple - 100% sykmelding](./multi-mode/form-submit.spec.ts#L31)
- [FHIR: simple - gradert sykmelding](./multi-mode/form-submit.spec.ts#L61)
- [FHIR: optional - multiple bidiagnoser](./multi-mode/form-submit.spec.ts#L90)
- [FHIR: optional - multiple perioder back to back](./multi-mode/form-submit.spec.ts#L121)
- [FHIR: optional - "har flere arbeidsforhold" should be part of payload if checked](./multi-mode/form-submit.spec.ts#L168)
- [FHIR: optional - when 100%, "arbeidsrelaterte og medisinske årsaker" should be part of payload if checked](./multi-mode/form-submit.spec.ts#L199)
- [FHIR: summary - "skal skjermes" should be part of payload if checked](./multi-mode/form-submit.spec.ts#L237)
- [Standalone: simple - 100% sykmelding](./multi-mode/form-submit.spec.ts#L31)
- [Standalone: simple - gradert sykmelding](./multi-mode/form-submit.spec.ts#L61)
- [Standalone: optional - multiple bidiagnoser](./multi-mode/form-submit.spec.ts#L90)
- [Standalone: optional - multiple perioder back to back](./multi-mode/form-submit.spec.ts#L121)
- [Standalone: optional - "har flere arbeidsforhold" should be part of payload if checked](./multi-mode/form-submit.spec.ts#L168)
- [Standalone: optional - when 100%, "arbeidsrelaterte og medisinske årsaker" should be part of payload if checked](./multi-mode/form-submit.spec.ts#L199)
- [Standalone: summary - "skal skjermes" should be part of payload if checked](./multi-mode/form-submit.spec.ts#L237)
  ## [FHIR: rule outcomes](./multi-mode/form-submit.spec.ts)
  - [FHIR: invalid but functionally expected: should be able to submit læll](./multi-mode/form-submit.spec.ts#L279)
  - [FHIR: manuell behandling and expected: should be able to submit læll](./multi-mode/form-submit.spec.ts#L307)
  - [FHIR: invalid but unexpected: should NOT be able to submit](./multi-mode/form-submit.spec.ts#L335)
  - [FHIR: person does not exist in PDL: should NOT be able to submit](./multi-mode/form-submit.spec.ts#L342)
  ## [Standalone: rule outcomes](./multi-mode/form-submit.spec.ts)
  - [Standalone: invalid but functionally expected: should be able to submit læll](./multi-mode/form-submit.spec.ts#L279)
  - [Standalone: manuell behandling and expected: should be able to submit læll](./multi-mode/form-submit.spec.ts#L307)
  - [Standalone: invalid but unexpected: should NOT be able to submit](./multi-mode/form-submit.spec.ts#L335)
  - [Standalone: person does not exist in PDL: should NOT be able to submit](./multi-mode/form-submit.spec.ts#L342)

## [multi-mode/form-tilbakedatering.spec.ts](./multi-mode/form-tilbakedatering.spec.ts)

- [FHIR: 'tilbakedatering' should be removed from state when period is updated to not be a 'tilbakedatering' period](./multi-mode/form-tilbakedatering.spec.ts#L24)
- [FHIR: 'tilbakedatering' is asked and required when fom is 5 days in the past](./multi-mode/form-tilbakedatering.spec.ts#L60)
- [FHIR: "tilbakedatering" and "Annen årsak" input field is required and part of payload when checked](./multi-mode/form-tilbakedatering.spec.ts#L132)
- [Standalone: 'tilbakedatering' should be removed from state when period is updated to not be a 'tilbakedatering' period](./multi-mode/form-tilbakedatering.spec.ts#L24)
- [Standalone: 'tilbakedatering' is asked and required when fom is 5 days in the past](./multi-mode/form-tilbakedatering.spec.ts#L60)
- [Standalone: "tilbakedatering" and "Annen årsak" input field is required and part of payload when checked](./multi-mode/form-tilbakedatering.spec.ts#L132)

## [multi-mode/form-utdypende-sporsmal.spec.ts](./multi-mode/form-utdypende-sporsmal.spec.ts)

- [FHIR: Submit sykmelding with utdypende spørsmål when owning all sykmeldinger](./multi-mode/form-utdypende-sporsmal.spec.ts#L22)
- [FHIR: Submit sykmelding with utdypende spørsmål when sykmeldinger is redacted but SYK_INN_SHOW_REDACTED: true](./multi-mode/form-utdypende-sporsmal.spec.ts#L67)
- [FHIR: Submit sykmelding with utdypende spørsmål when sykmeldinger is redacted last one is owned by user](./multi-mode/form-utdypende-sporsmal.spec.ts#L115)
- [FHIR: Trigger all utdypende spørsmål in one 100% sykmelding](./multi-mode/form-utdypende-sporsmal.spec.ts#L146)
- [FHIR: Trigger week 17 when week 7 has already been answered](./multi-mode/form-utdypende-sporsmal.spec.ts#L196)
- [Standalone: Submit sykmelding with utdypende spørsmål when owning all sykmeldinger](./multi-mode/form-utdypende-sporsmal.spec.ts#L22)
- [Standalone: Submit sykmelding with utdypende spørsmål when sykmeldinger is redacted but SYK_INN_SHOW_REDACTED: true](./multi-mode/form-utdypende-sporsmal.spec.ts#L67)
- [Standalone: Submit sykmelding with utdypende spørsmål when sykmeldinger is redacted last one is owned by user](./multi-mode/form-utdypende-sporsmal.spec.ts#L115)
- [Standalone: Trigger all utdypende spørsmål in one 100% sykmelding](./multi-mode/form-utdypende-sporsmal.spec.ts#L146)
- [Standalone: Trigger week 17 when week 7 has already been answered](./multi-mode/form-utdypende-sporsmal.spec.ts#L196)

## [multi-mode/launch.spec.ts](./multi-mode/launch.spec.ts)

- [FHIR: successful launch but is not a PILOT_USER should see no graphql requests @feature-toggle](./multi-mode/launch.spec.ts#L6)
- [Standalone: successful launch but is not a PILOT_USER should see no graphql requests @feature-toggle](./multi-mode/launch.spec.ts#L6)

<!-- TESTS:END -->
