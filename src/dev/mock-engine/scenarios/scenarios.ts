import * as R from 'remeda'

import { SykInnApiSykmelding } from '@core/services/syk-inn-api/schema/sykmelding'
import { AaregArbeidsforhold } from '@core/services/aareg/aareg-schema'

import { SykmeldingBuilder } from './SykInnApiSykmeldingBuilder'
import { DraftBuilder, ScenarioDraft } from './DraftBuilder'
import { multipleAaregArbeidsforhold, simpleAaregArbeidsforhold } from './aareg-arbeidsforhold'

export type Scenario = {
    sykmeldinger: SykInnApiSykmelding[]
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
} satisfies Record<string, { description: string; scenario: ScenarioCreator }>

export const scenarios = { ...simpleScenarios }
