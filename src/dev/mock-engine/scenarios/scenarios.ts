import * as R from 'remeda'

import { SykInnApiSykmelding, SykInnApiSykmeldingRedacted } from '@core/services/syk-inn-api/schema/sykmelding'
import { AaregArbeidsforhold } from '@core/services/aareg/aareg-schema'

import { SykmeldingBuilder } from './SykInnApiSykmeldingBuilder'
import { DraftBuilder, ScenarioDraft } from './DraftBuilder'
import { multipleAaregArbeidsforhold, simpleAaregArbeidsforhold } from './aareg-arbeidsforhold'

export type Scenario = {
    sykmeldinger: (SykInnApiSykmelding | SykInnApiSykmeldingRedacted)[]
    arbeidsforhold: AaregArbeidsforhold[]
    drafts: ScenarioDraft[]
}

type ScenarioCreator = () => Scenario

export type Scenarios = keyof typeof scenarios

const simpleScenarios = {
    normal: {
        description: 'Normal user with a few previous sykmeldinger, one current',
        scenario: () => ({
            sykmeldinger: [
                new SykmeldingBuilder({ offset: -7 }).enkelAktivitet({ offset: 0, days: 14 }).build(),
                new SykmeldingBuilder({ offset: -50 }).enkelAktivitet({ offset: 0, days: 7 }).build(),
                new SykmeldingBuilder({ offset: -90 }).enkelAktivitet({ offset: 0, days: 7 }).build(),
            ],
            arbeidsforhold: simpleAaregArbeidsforhold,
            drafts: [],
        }),
    },
    empty: {
        description: 'No previous sykmeldinger, no current sykmelding',
        scenario: () => ({
            sykmeldinger: [],
            arbeidsforhold: simpleAaregArbeidsforhold,
            drafts: [],
        }),
    },
    'one-current-to-tomorrow': {
        description: 'One current sykmelding, active until tomorrow',
        scenario: () => ({
            sykmeldinger: [new SykmeldingBuilder({ offset: -13 }).enkelAktivitet({ offset: 0, days: 14 }).build()],
            arbeidsforhold: simpleAaregArbeidsforhold,
            drafts: [],
        }),
    },
    'multiple-arbeidsforhold': {
        description: 'Multiple arbeidsforhold, no sykmeldinger',
        scenario: () => ({
            sykmeldinger: [],
            arbeidsforhold: multipleAaregArbeidsforhold,
            drafts: [],
        }),
    },
    'no-arbeidsforhold': {
        description: 'No arbeidsforhold, no sykmeldinger',
        scenario: () => ({
            sykmeldinger: [],
            arbeidsforhold: [],
            drafts: [],
        }),
    },
    'plenty-of-drafts': {
        description: 'User with many drafts, no sykmeldinger',
        scenario: () => ({
            sykmeldinger: [],
            arbeidsforhold: simpleAaregArbeidsforhold,
            drafts: R.range(0, 15).map((idx) => new DraftBuilder().lastUpdated(idx * 3).build()),
        }),
    },
    'some-redacted-sykmeldinger': {
        description: 'Mix of own sykmeldinger and sykmeldinger from other behandlere',
        scenario: () => ({
            sykmeldinger: [
                new SykmeldingBuilder({ offset: -7 }).enkelAktivitet({ offset: 0, days: 14 }).build(),
                new SykmeldingBuilder({ offset: -50 }).enkelAktivitet({ offset: 0, days: 7 }).buildRedacted(),
                new SykmeldingBuilder({ offset: -90 }).enkelAktivitet({ offset: 0, days: 7 }).buildRedacted(),
            ],
            arbeidsforhold: simpleAaregArbeidsforhold,
            drafts: [],
        }),
    },
    'utfyllende-sporsmal': {
        description: 'User with a long continuous sykefravær, should trigger utfyllende spørsmål',
        scenario: () => ({
            sykmeldinger: [
                new SykmeldingBuilder({ offset: -10 }).enkelAktivitet({ offset: 0, days: 10 }).build(),
                new SykmeldingBuilder({ offset: -50 }).enkelAktivitet({ offset: 0, days: 25 }).build(),
                new SykmeldingBuilder({ offset: -100 }).enkelAktivitet({ offset: 0, days: 20 }).build(),
            ],
            arbeidsforhold: simpleAaregArbeidsforhold,
            drafts: [],
        }),
    },
} satisfies Record<string, { description: string; scenario: ScenarioCreator }>

export const scenarios = { ...simpleScenarios }
