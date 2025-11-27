import { beforeAll, describe, it, expect } from 'vitest'
import { StartedTestContainer } from 'testcontainers'

import { getSykInnApiPath, initializeSykInnApi } from '@lib/test/syk-inn-api'
import { sykInnApiService } from '@core/services/syk-inn-api/syk-inn-api-service'
import { OpprettSykmeldingPayload } from '@core/services/syk-inn-api/schema/opprett'
import { initializeValkey } from '@lib/test/valkey'
import { daysAgo, inDays, today } from '@lib/test/date-utils'

describe('SykInnApi integration', () => {
    let sykInnApi: StartedTestContainer
    let valkey: StartedTestContainer

    beforeAll(async () => {
        valkey = await initializeValkey()
        sykInnApi = await initializeSykInnApi()

        process.env.LOCAL_SYK_INN_API_HOST = `${sykInnApi.getHost()}:${sykInnApi.getMappedPort(8080)}`
        process.env.VALKEY_HOST_SYK_INN = `${valkey.getHost()}:${valkey.getMappedPort(6379)}`
    }, 60_000)

    it('sanity check health endpoint', async () => {
        const healthResult = await fetch(getSykInnApiPath(sykInnApi, '/internal/health')).then((it) => it.json())

        expect(healthResult.status).toEqual('UP')
    })

    it('should be able to verify with all values', async () => {
        const opprettResult = await sykInnApiService.verifySykmelding(createFullOpprettSykmeldingPayload())

        // If verify is OK, it returns true
        expect(opprettResult).toBe(true)
    })

    it('should be able to opprettSykmelding with all values', async () => {
        const payload = createFullOpprettSykmeldingPayload()
        const opprettResult = await sykInnApiService.opprettSykmelding(payload)

        if ('errorType' in opprettResult) {
            throw Error(`Opprett failed, expected OK but had error: ${opprettResult.errorType}`)
        }

        expect(opprettResult.sykmeldingId).toBeDefined()
        expect(opprettResult.values.hoveddiagnose?.system).toEqual(payload.values.hoveddiagnose.system)
        expect(opprettResult.values.hoveddiagnose?.code).toEqual(payload.values.hoveddiagnose.code)
    })
})

const createFullOpprettSykmeldingPayload = (): OpprettSykmeldingPayload => ({
    meta: {
        source: `syk-inn test`,
        sykmelderHpr: '123456',
        pasientIdent: '01010112345',
        legekontorOrgnr: '987654321',
        legekontorTlf: '+4712345678',
    },
    values: {
        pasientenSkalSkjermes: true,
        hoveddiagnose: {
            system: 'ICPC2',
            code: 'P74',
        },
        bidiagnoser: [
            {
                system: 'ICPC2',
                code: 'P17',
            },
        ],
        aktivitet: [
            {
                type: 'AKTIVITET_IKKE_MULIG',
                fom: today(),
                tom: inDays(14),
                medisinskArsak: {
                    isMedisinskArsak: true,
                },
                arbeidsrelatertArsak: {
                    isArbeidsrelatertArsak: true,
                    arbeidsrelaterteArsaker: ['TILRETTELEGGING_IKKE_MULIG', 'ANNET'],
                    annenArbeidsrelatertArsak: 'Trenger tilrettelegging',
                },
            },
            {
                type: 'GRADERT',
                fom: inDays(15),
                tom: inDays(30),
                grad: 60,
                reisetilskudd: false,
            },
        ],
        meldinger: {
            tilNav: 'Dette er en melding til Nav',
            tilArbeidsgiver: 'Dette er en melding til arbeidsgiver',
        },
        svangerskapsrelatert: true,
        yrkesskade: {
            yrkesskade: true,
            skadedato: daysAgo(3),
        },
        arbeidsgiver: { arbeidsgivernavn: 'Test Testere AS' },
        tilbakedatering: {
            begrunnelse: 'Vært i koma',
            startdato: daysAgo(3),
        },
        utdypendeSporsmal: {
            utfordringerMedArbeid: 'Kan ikke sitte lenge',
            medisinskOppsummering: 'Pasienten har influensa',
            hensynPaArbeidsplassen: 'Trenger ro og hvile',
        },
    },
})
