import * as R from 'remeda'

import { SykInnApiSykmelding } from '@services/syk-inn-api/schema/sykmelding'

import { SykmeldingBuilder } from './SykInnApiSykmeldingBuilder'
import { DraftBuilder, ScenarioDraft } from './DraftBuilder'

export type Scenario = {
    sykmeldinger: SykInnApiSykmelding[]
    drafts: ScenarioDraft[]
}

type ScenarioCreator = () => Scenario

export type Scenarios = keyof typeof scenarios

export const simpleScenarios = {
    normal: {
        description: 'Normal user with a few previous sykmeldinger, one current',
        scenario: () => ({
            sykmeldinger: [
                new SykmeldingBuilder({ offset: -7 }).enkelAktivitet({ offset: 0, days: 14 }).build(),
                new SykmeldingBuilder({ offset: -50 }).enkelAktivitet({ offset: 0, days: 7 }).build(),
                new SykmeldingBuilder({ offset: -90 }).enkelAktivitet({ offset: 0, days: 7 }).build(),
            ],
            drafts: [],
        }),
    },
    empty: {
        description: 'No previous sykmeldinger, no current sykmelding',
        scenario: () => ({
            sykmeldinger: [],
            drafts: [],
        }),
    },
    'plenty-of-drafts': {
        description: 'User with many drafts, no sykmeldinger',
        scenario: () => ({
            sykmeldinger: [],
            drafts: R.range(0, 15).map((idx) => new DraftBuilder().lastUpdated(idx * 3).build()),
        }),
    },
} satisfies Record<string, { description: string; scenario: ScenarioCreator }>

export const scenarios = { ...simpleScenarios }
