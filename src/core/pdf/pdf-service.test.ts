import { describe, test, expect } from 'vitest'

import { SykmeldingBuilder } from '#dev/mock-engine/scenarios/SykInnApiSykmeldingBuilder'

import { mapSykInnToPdfPayload } from './pdf-service'

describe('mapSykInnToPdfPayload - friskmelding til arbeidsformidling', () => {
    test('includes friskmelding line in andreSporsmal when true', () => {
        const sykmelding = new SykmeldingBuilder()
            .enkelAktivitet({ offset: 0, days: 7 })
            .friskmeldingTilArbeidsformidling(true)
            .build()

        const payload = mapSykInnToPdfPayload(sykmelding)

        expect(payload.values.andreSporsmal).toContain(
            'Pasienten kan være aktuell for friskmelding til arbeidsformidling',
        )
    })

    test('does not include friskmelding line when false', () => {
        const sykmelding = new SykmeldingBuilder()
            .enkelAktivitet({ offset: 0, days: 7 })
            .friskmeldingTilArbeidsformidling(false)
            .build()

        const payload = mapSykInnToPdfPayload(sykmelding)

        expect(payload.values.andreSporsmal ?? []).not.toContain(
            'Pasienten kan være aktuell for friskmelding til arbeidsformidling',
        )
    })
})
