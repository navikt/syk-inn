import { SykInnApiSykmelding } from '@services/syk-inn-api/schema/sykmelding'

import { SykmeldingBuilder } from './SykInnApiSykmeldingBuilder'

export type Scenario = {
    sykmeldinger: SykInnApiSykmelding[]
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
        }),
    },
    empty: {
        description: 'No previous sykmeldinger, no current sykmelding',
        scenario: () => ({
            sykmeldinger: [],
        }),
    },
} satisfies Record<string, { description: string; scenario: ScenarioCreator }>

export const scenarios = { ...simpleScenarios }
