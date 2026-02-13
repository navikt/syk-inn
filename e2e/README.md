# e2e

Workspace for end-to-end tests for the project.

Run the tests from root using `yarn e2e:dev` or `yarn e2e`.

# Current test suite:

<!-- TESTS:START -->

## [fhir/dashboard/drafts.spec.ts](./fhir/dashboard/drafts.spec.ts)

- [should be able to quickly delete a lot of drafts](./fhir/dashboard/drafts.spec.ts#L11)
- [should be able to open and edit a draft from the dashboard](./fhir/dashboard/drafts.spec.ts#L31)

## [fhir/dashboard/dupliser.spec.ts](./fhir/dashboard/dupliser.spec.ts)

- [should be able to dupliser (from dashboard) an existing sykmelding with correct values](./fhir/dashboard/dupliser.spec.ts#L30)
- [should be able to dupliser (from dashboard) an existing sykmelding, go to summary, and return to form without losing values](./fhir/dashboard/dupliser.spec.ts#L86)
- [should not be possible to dupliser (from dashboard) old sykmelding](./fhir/dashboard/dupliser.spec.ts#L139)

## [fhir/dashboard/forleng.spec.ts](./fhir/dashboard/forleng.spec.ts)

- [should be able to forlenge an existing sykmelding with correct values](./fhir/dashboard/forleng.spec.ts#L30)
- [should be able to forleng a sykmelding, go to summary, and return to form without losing values](./fhir/dashboard/forleng.spec.ts#L87)

## [fhir/dashboard/redacted.spec.ts](./fhir/dashboard/redacted.spec.ts)

- [redacted @feature-toggle should see other users sykmeldinger as redacted versions](./fhir/dashboard/redacted.spec.ts#L6)
- [redacted @feature-toggle toggled off - should not display any other sykmeldinger](./fhir/dashboard/redacted.spec.ts#L30)

## [fhir/dashboard/sykmelding.spec.ts](./fhir/dashboard/sykmelding.spec.ts)

- [should be able to view previous sykmelding](./fhir/dashboard/sykmelding.spec.ts#L8)
- [previous sykmelding within 4 days should still show as a full sykmelding](./fhir/dashboard/sykmelding.spec.ts#L29)
- [previous sykmelding older than 4 days should display less values](./fhir/dashboard/sykmelding.spec.ts#L50)

## [fhir/fhir-chaosmonkey.spec.ts](./fhir/fhir-chaosmonkey.spec.ts)

- [spamming 'Send'-button repeatedly should only submit 1 sykmelding](./fhir/fhir-chaosmonkey.spec.ts#L10)

## [fhir/fhir-feedback.spec.ts](./fhir/fhir-feedback.spec.ts)

- [submitting feedback should work](./fhir/fhir-feedback.spec.ts#L11)
- [submitting feedback without contact should work](./fhir/fhir-feedback.spec.ts#L24)
- [submitting feedback on kvittering page should work](./fhir/fhir-feedback.spec.ts#L37)

## [fhir/fhir-form-interactions.spec.ts](./fhir/fhir-form-interactions.spec.ts)

## ['shorthand' date interactions](./fhir/fhir-form-interactions.spec.ts)

- [when using shorthand on a forlenget sykmelding, the shorhand should be from the start of the forlengelse](./fhir/fhir-form-interactions.spec.ts#L13)
- [when using shorthand on a forlenget sykmelding in the tom field, the shorhand should be from the start of the forlengelse if fom is empty](./fhir/fhir-form-interactions.spec.ts#L36)

## [fhir/fhir-form-rule-validations.spec.ts](./fhir/fhir-form-rule-validations.spec.ts)

- [UGYLDIG_ORGNR_LENGDE](./fhir/fhir-form-rule-validations.spec.ts#L8)

## [fhir/fhir-form-submit.spec.ts](./fhir/fhir-form-submit.spec.ts)

- [submit with only default values and prefilled FHIR values](./fhir/fhir-form-submit.spec.ts#L26)
- [should be able to submit purely with shortcuts](./fhir/fhir-form-submit.spec.ts#L62)
- [should pre-fill bidiagnoser from FHIR @feature-toggle](./fhir/fhir-form-submit.spec.ts#L97)
    ## [Resetting diagnoser when prefilled from FHIR @feature-toggle](./fhir/fhir-form-submit.spec.ts)
    - [adding extra diagnose and resetting them should remove them](./fhir/fhir-form-submit.spec.ts#L138)
    - [removing diagonses from FHIR prefill and reseetting them should add them back](./fhir/fhir-form-submit.spec.ts#L171)

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

- [FHIR: aareg @feature-toggle - should be able to fill arbeidsforhold with AAREG data](./multi-mode/form-aareg.spec.ts#L23)
- [FHIR: aareg @feature-toggle - going to summary and returning should keep arbeidsgiver in Select](./multi-mode/form-aareg.spec.ts#L65)
- [FHIR: aareg @feature-toggle - saving a draft and returning should keep arbeidsgiver in Select](./multi-mode/form-aareg.spec.ts#L106)
- [Standalone: aareg @feature-toggle - should be able to fill arbeidsforhold with AAREG data](./multi-mode/form-aareg.spec.ts#L23)
- [Standalone: aareg @feature-toggle - going to summary and returning should keep arbeidsgiver in Select](./multi-mode/form-aareg.spec.ts#L65)
- [Standalone: aareg @feature-toggle - saving a draft and returning should keep arbeidsgiver in Select](./multi-mode/form-aareg.spec.ts#L106)

## [multi-mode/form-annen-fravarsgrunn.spec.ts](./multi-mode/form-annen-fravarsgrunn.spec.ts)

- [FHIR: Submit sykmelding with annen lovfestet fraværsgrunn](./multi-mode/form-annen-fravarsgrunn.spec.ts#L18)
- [FHIR: When ticking the checkbox the reason should be required](./multi-mode/form-annen-fravarsgrunn.spec.ts#L49)
- [Standalone: Submit sykmelding with annen lovfestet fraværsgrunn](./multi-mode/form-annen-fravarsgrunn.spec.ts#L18)
- [Standalone: When ticking the checkbox the reason should be required](./multi-mode/form-annen-fravarsgrunn.spec.ts#L49)

## [multi-mode/form-interactions.spec.ts](./multi-mode/form-interactions.spec.ts)

- [FHIR: hoveddiagnose - shall be able to edit diagnose](./multi-mode/form-interactions.spec.ts#L17)
- [FHIR: bidiagnoser - adding, editing, deleting adhd test](./multi-mode/form-interactions.spec.ts#L33)
- [Standalone: hoveddiagnose - shall be able to edit diagnose](./multi-mode/form-interactions.spec.ts#L17)
- [Standalone: bidiagnoser - adding, editing, deleting adhd test](./multi-mode/form-interactions.spec.ts#L33)
    ## [FHIR: 'shorthand' date interactions](./multi-mode/form-interactions.spec.ts)
    - [FHIR: when using shorthand on n+1 period, the shorhand should be from the tom+1 of the previous period](./multi-mode/form-interactions.spec.ts#L69)
    - [FHIR: when using shorthand on n+1 period, should handle tom shorthands](./multi-mode/form-interactions.spec.ts#L99)
    - [FHIR: misc interactions through fom-field](./multi-mode/form-interactions.spec.ts#L127)
    - [FHIR: misc interactions through tom-field](./multi-mode/form-interactions.spec.ts#L153)
    - [FHIR: should display popover with hint for fom field](./multi-mode/form-interactions.spec.ts#L193)
    - [FHIR: should display popover with hint for tom field](./multi-mode/form-interactions.spec.ts#L206)
    ## [Standalone: 'shorthand' date interactions](./multi-mode/form-interactions.spec.ts)
    - [Standalone: when using shorthand on n+1 period, the shorhand should be from the tom+1 of the previous period](./multi-mode/form-interactions.spec.ts#L69)
    - [Standalone: when using shorthand on n+1 period, should handle tom shorthands](./multi-mode/form-interactions.spec.ts#L99)
    - [Standalone: misc interactions through fom-field](./multi-mode/form-interactions.spec.ts#L127)
    - [Standalone: misc interactions through tom-field](./multi-mode/form-interactions.spec.ts#L153)
    - [Standalone: should display popover with hint for fom field](./multi-mode/form-interactions.spec.ts#L193)
    - [Standalone: should display popover with hint for tom field](./multi-mode/form-interactions.spec.ts#L206)

## [multi-mode/form-persistence.spec.ts](./multi-mode/form-persistence.spec.ts)

- [FHIR: filling out the form, and returning to main step, should keep all values](./multi-mode/form-persistence.spec.ts#L62)
- [FHIR: filling out the form, saving a draft, and returning to the form, should keep all the values](./multi-mode/form-persistence.spec.ts#L76)
- [FHIR: filling out the form, and reloading on kvittering page should restore values](./multi-mode/form-persistence.spec.ts#L112)
- [Standalone: filling out the form, and returning to main step, should keep all values](./multi-mode/form-persistence.spec.ts#L62)
- [Standalone: filling out the form, saving a draft, and returning to the form, should keep all the values](./multi-mode/form-persistence.spec.ts#L76)
- [Standalone: filling out the form, and reloading on kvittering page should restore values](./multi-mode/form-persistence.spec.ts#L112)

## [multi-mode/form-rule-validations.spec.ts](./multi-mode/form-rule-validations.spec.ts)

- [FHIR: "Periode"-rules](./multi-mode/form-rule-validations.spec.ts#L49)
- [FHIR: "Time in relation to now"-rules](./multi-mode/form-rule-validations.spec.ts#L116)
- ⚠️ [FHIR: UGYLDIG_KODEVERK_FOR_HOVEDDIAGNOSE, UGYLDIG_KODEVERK_FOR_BIDIAGNOSE](./multi-mode/form-rule-validations.spec.ts#L150)
- [Standalone: "Periode"-rules](./multi-mode/form-rule-validations.spec.ts#L49)
- [Standalone: "Time in relation to now"-rules](./multi-mode/form-rule-validations.spec.ts#L116)
- ⚠️ [Standalone: UGYLDIG_KODEVERK_FOR_HOVEDDIAGNOSE, UGYLDIG_KODEVERK_FOR_BIDIAGNOSE](./multi-mode/form-rule-validations.spec.ts#L150)

## [multi-mode/form-submit.spec.ts](./multi-mode/form-submit.spec.ts)

- [FHIR: simple - 100% sykmelding](./multi-mode/form-submit.spec.ts#L33)
- [FHIR: simple - gradert sykmelding](./multi-mode/form-submit.spec.ts#L63)
- [FHIR: optional - multiple bidiagnoser](./multi-mode/form-submit.spec.ts#L92)
- [FHIR: optional - multiple perioder back to back](./multi-mode/form-submit.spec.ts#L123)
- [FHIR: optional - 'tilbakedatering' is asked and required when fom is 5 days in the past](./multi-mode/form-submit.spec.ts#L160)
- [FHIR: optional - "tilbakedatering" and "Annen årsak" input field is required and part of payload when checked](./multi-mode/form-submit.spec.ts#L231)
- [FHIR: optional - "har flere arbeidsforhold" should be part of payload if checked](./multi-mode/form-submit.spec.ts#L270)
- [FHIR: optional - when 100%, "arbeidsrelaterte og medisinske årsaker" should be part of payload if checked](./multi-mode/form-submit.spec.ts#L298)
- [FHIR: summary - "skal skjermes" should be part of payload if checked](./multi-mode/form-submit.spec.ts#L340)
- [Standalone: simple - 100% sykmelding](./multi-mode/form-submit.spec.ts#L33)
- [Standalone: simple - gradert sykmelding](./multi-mode/form-submit.spec.ts#L63)
- [Standalone: optional - multiple bidiagnoser](./multi-mode/form-submit.spec.ts#L92)
- [Standalone: optional - multiple perioder back to back](./multi-mode/form-submit.spec.ts#L123)
- [Standalone: optional - 'tilbakedatering' is asked and required when fom is 5 days in the past](./multi-mode/form-submit.spec.ts#L160)
- [Standalone: optional - "tilbakedatering" and "Annen årsak" input field is required and part of payload when checked](./multi-mode/form-submit.spec.ts#L231)
- [Standalone: optional - "har flere arbeidsforhold" should be part of payload if checked](./multi-mode/form-submit.spec.ts#L270)
- [Standalone: optional - when 100%, "arbeidsrelaterte og medisinske årsaker" should be part of payload if checked](./multi-mode/form-submit.spec.ts#L298)
- [Standalone: summary - "skal skjermes" should be part of payload if checked](./multi-mode/form-submit.spec.ts#L340)
    ## [FHIR: rule outcomes](./multi-mode/form-submit.spec.ts)
    - [FHIR: invalid but functionally expected: should be able to submit læll](./multi-mode/form-submit.spec.ts#L378)
    - [FHIR: manuell behandling and expected: should be able to submit læll](./multi-mode/form-submit.spec.ts#L404)
    - [FHIR: invalid but unexpected: should NOT be able to submit](./multi-mode/form-submit.spec.ts#L430)
    - [FHIR: person does not exist in PDL: should NOT be able to submit](./multi-mode/form-submit.spec.ts#L437)
    ## [Standalone: rule outcomes](./multi-mode/form-submit.spec.ts)
    - [Standalone: invalid but functionally expected: should be able to submit læll](./multi-mode/form-submit.spec.ts#L378)
    - [Standalone: manuell behandling and expected: should be able to submit læll](./multi-mode/form-submit.spec.ts#L404)
    - [Standalone: invalid but unexpected: should NOT be able to submit](./multi-mode/form-submit.spec.ts#L430)
    - [Standalone: person does not exist in PDL: should NOT be able to submit](./multi-mode/form-submit.spec.ts#L437)

## [multi-mode/form-utdypende-sporsmal.spec.ts](./multi-mode/form-utdypende-sporsmal.spec.ts)

- [FHIR: Submit sykmelding with utdypende spørsmål when owning all sykmeldinger](./multi-mode/form-utdypende-sporsmal.spec.ts#L20)
- [FHIR: Submit sykmelding with utdypende spørsmål when sykmeldinger is redacted but SYK_INN_SHOW_REDACTED: true](./multi-mode/form-utdypende-sporsmal.spec.ts#L57)
- [FHIR: Submit sykmelding with utdypende spørsmål when sykmeldinger is redacted last one is owned by user](./multi-mode/form-utdypende-sporsmal.spec.ts#L97)
- [Standalone: Submit sykmelding with utdypende spørsmål when owning all sykmeldinger](./multi-mode/form-utdypende-sporsmal.spec.ts#L20)
- [Standalone: Submit sykmelding with utdypende spørsmål when sykmeldinger is redacted but SYK_INN_SHOW_REDACTED: true](./multi-mode/form-utdypende-sporsmal.spec.ts#L57)
- [Standalone: Submit sykmelding with utdypende spørsmål when sykmeldinger is redacted last one is owned by user](./multi-mode/form-utdypende-sporsmal.spec.ts#L97)

## [multi-mode/launch.spec.ts](./multi-mode/launch.spec.ts)

- [FHIR: successful launch but is not a PILOT_USER should see no graphql requests @feature-toggle](./multi-mode/launch.spec.ts#L6)
- [Standalone: successful launch but is not a PILOT_USER should see no graphql requests @feature-toggle](./multi-mode/launch.spec.ts#L6)

<!-- TESTS:END -->
