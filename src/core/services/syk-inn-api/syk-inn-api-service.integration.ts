import { beforeAll, describe, it, expect } from 'vitest'
import { StartedTestContainer } from 'testcontainers'
import { Kafka } from 'kafkajs'
import * as R from 'remeda'

import { getSykInnApiPath, initializeSykInnApi } from '@lib/test/syk-inn-api'
import { sykInnApiService } from '@core/services/syk-inn-api/syk-inn-api-service'
import { OpprettSykmeldingMeta, OpprettSykmeldingPayload } from '@core/services/syk-inn-api/schema/opprett'
import { initializeValkey } from '@lib/test/valkey'
import { daysAgo, inDays, today } from '@lib/test/date-utils'
import { consumeUntil, initializeConsumer, initializeKafka } from '@lib/test/syk-inn-kafka'
import { AnnenFravarsgrunnArsak } from '@resolvers'

describe('SykInnApi integration', () => {
    let sykInnApi: StartedTestContainer
    let valkey: StartedTestContainer
    let kafka: Kafka

    beforeAll(async () => {
        const sykInnContainers = await initializeSykInnApi(false)
        sykInnApi = sykInnContainers.sykInnApi
        valkey = await initializeValkey()
        kafka = await initializeKafka(sykInnContainers.kafka)

        process.env.LOCAL_SYK_INN_API_HOST = `${sykInnApi.getHost()}:${sykInnApi.getMappedPort(8080)}`
        process.env.VALKEY_HOST_SYK_INN = `${valkey.getHost()}:${valkey.getMappedPort(6379)}`
    }, 60_000)

    it('sanity check health endpoint', async () => {
        const healthResult = await fetch(getSykInnApiPath(sykInnApi, '/internal/health')).then((it) => it.json())

        expect(healthResult.status).toEqual('UP')
    })

    it('POST /sykmelding/verify should be able to verify with all values', async () => {
        const opprettResult = await sykInnApiService.verifySykmelding(createFullOpprettSykmeldingPayload())

        // If verify is OK, it returns true
        expect(opprettResult).toBe(true)
    })

    it('POST /sykmelding/verify should inform that patient does not exist', async () => {
        const opprettResult = await sykInnApiService.verifySykmelding(
            createFullOpprettSykmeldingPayload({
                pasientIdent: 'does-not-exist',
            }),
        )

        if (typeof opprettResult === 'boolean') {
            throw Error(`Expected person not to exist, but got OK`)
        }

        if (!('message' in opprettResult)) {
            throw Error(
                `Expected person not to exist, but didn't get the right error type, was ${opprettResult.errorType} instead`,
            )
        }

        expect(opprettResult.message).toEqual('Person does not exist')
    })

    it('POST /sykmelding should be able to opprettSykmelding with all values', async () => {
        const payload = createFullOpprettSykmeldingPayload()
        const opprettResult = await sykInnApiService.opprettSykmelding(payload)

        if ('errorType' in opprettResult) {
            throw Error(`Opprett failed, expected OK but had error: ${opprettResult.errorType}`)
        }

        expect(opprettResult.sykmeldingId).toBeDefined()
        expect(opprettResult.values.hoveddiagnose?.system).toEqual(payload.values.hoveddiagnose.system)
        expect(opprettResult.values.hoveddiagnose?.code).toEqual(payload.values.hoveddiagnose.code)
    })

    it('POST /sykmelding should handle idempotentness correctly', async () => {
        const submitId = crypto.randomUUID()

        // Create first
        const payload = createFullOpprettSykmeldingPayload(undefined, undefined, submitId)
        const opprettResult = await sykInnApiService.opprettSykmelding(payload)

        if ('errorType' in opprettResult) {
            throw Error(`Opprett failed, expected OK but had error: ${opprettResult.errorType}`)
        }

        expect(opprettResult.sykmeldingId).toBeDefined()

        // Same submit ID, should return same sykmelding
        const secondPayload = createFullOpprettSykmeldingPayload(undefined, undefined, submitId)
        const secondResult = await sykInnApiService.opprettSykmelding(secondPayload)

        if ('errorType' in secondResult) {
            throw Error(`Opprett failed, expected OK but had error: ${secondResult.errorType}`)
        }

        expect(opprettResult.sykmeldingId).toBeDefined()
        expect(secondResult.sykmeldingId).toEqual(opprettResult.sykmeldingId)
    })

    it('POST /sykmelding should handle idempotentness correctly even with simultaneous requests', async () => {
        const payload = createFullOpprettSykmeldingPayload()
        const [result1, result2] = await Promise.all([
            sykInnApiService.opprettSykmelding(payload),
            sykInnApiService.opprettSykmelding(payload),
        ])

        if ('errorType' in result1) {
            throw Error(`Opprett failed, expected OK but had error: ${result1.errorType}`)
        }
        if ('errorType' in result2) {
            throw Error(`Opprett failed, expected OK but had error: ${result2.errorType}`)
        }

        expect(result1.sykmeldingId).toBeDefined()
        expect(result2.sykmeldingId).toBeDefined()
        expect(result2.sykmeldingId).toEqual(result1.sykmeldingId)
    })

    it('POST /sykmelding should be able to opprettSykmelding with bare minimum values', async () => {
        const payload = createFullOpprettSykmeldingPayload(undefined, {
            bidiagnoser: [],
            meldinger: {
                tilNav: null,
                tilArbeidsgiver: null,
            },
            arbeidsgiver: null,
            yrkesskade: null,
            utdypendeSporsmal: null,
            tilbakedatering: null,
            svangerskapsrelatert: false,
            pasientenSkalSkjermes: false,
        })

        const opprettResult = await sykInnApiService.opprettSykmelding(payload)

        if ('errorType' in opprettResult) {
            throw Error(`Opprett failed, expected OK but had error: ${opprettResult.errorType}`)
        }

        expect(opprettResult.sykmeldingId).toBeDefined()
        expect(opprettResult.values.hoveddiagnose?.system).toEqual(payload.values.hoveddiagnose.system)
        expect(opprettResult.values.hoveddiagnose?.code).toEqual(payload.values.hoveddiagnose.code)
        expect(opprettResult.values.arbeidsgiver).toBeNull()
        expect(opprettResult.values.yrkesskade).toBeNull()
        expect(opprettResult.values.utdypendeSporsmal).toBeNull()
        expect(opprettResult.values.tilbakedatering).toBeNull()
    })

    it('POST /sykmelding should be published to kafka from syk-inn-api', async () => {
        const payload = createFullOpprettSykmeldingPayload(undefined, {
            hoveddiagnose: { system: 'ICPC2B', code: 'T99.0084' },
            bidiagnoser: [{ system: 'ICPC2', code: 'D97' }],
        })
        const opprettResult = await sykInnApiService.opprettSykmelding(payload)

        if ('errorType' in opprettResult) {
            throw Error(`Opprett failed, expected OK but had error: ${opprettResult.errorType}`)
        }

        expect(opprettResult.sykmeldingId).toBeDefined()

        const consumer = await initializeConsumer(kafka)
        const kafkaMessage = await consumeUntil(consumer, opprettResult.sykmeldingId)

        expect(kafkaMessage.metadata.type).toEqual('DIGITAL')
        expect(kafkaMessage.metadata.orgnummer).toEqual('987654321')

        expect(kafkaMessage.sykmelding.metadata.avsenderSystem.navn).toEqual('syk-inn test')
        expect(kafkaMessage.sykmelding.pasient.fnr).toEqual('01010112345')
        expect(kafkaMessage.sykmelding.medisinskVurdering.hovedDiagnose.system).toEqual('ICPC2B')
        expect(kafkaMessage.sykmelding.medisinskVurdering.hovedDiagnose.kode).toEqual('T99.0084')
        expect(kafkaMessage.sykmelding.medisinskVurdering.biDiagnoser[0].system).toEqual('ICPC2')
        expect(kafkaMessage.sykmelding.medisinskVurdering.biDiagnoser[0].kode).toEqual('D97')
        expect(kafkaMessage.sykmelding.medisinskVurdering.biDiagnoser).toHaveLength(1)

        // Assert that utdypende spørsmål are part of the kafka message
        const utdypendeSporsmal: KafkaUtdypendeSporsmal[] = kafkaMessage.sykmelding.utdypendeSporsmal
        expect(utdypendeSporsmal).toBeDefined()
        expect(utdypendeSporsmal?.find((it) => it.type === 'MEDISINSK_OPPSUMMERING')?.svar).toEqual(
            'Pasienten har influensa',
        )
        expect(utdypendeSporsmal?.find((it) => it.type === 'UTFORDRINGER_MED_GRADERT_ARBEID')?.svar).toEqual(
            'Kan ikke sitte lenge',
        )
        expect(utdypendeSporsmal?.find((it) => it.type === 'HENSYN_PA_ARBEIDSPLASSEN')?.svar).toEqual(
            'Trenger ro og hvile',
        )
    }, 10_000)

    it('GET /sykmelding/<id> should fetch correctly', async () => {
        const payload = createFullOpprettSykmeldingPayload()
        const opprettResult = await sykInnApiService.opprettSykmelding(payload)

        if ('errorType' in opprettResult) {
            throw Error(`Opprett failed, expected OK but had error: ${opprettResult.errorType}`)
        }

        const singleSykmelding = await sykInnApiService.getSykmelding(
            opprettResult.sykmeldingId,
            payload.meta.sykmelderHpr,
        )

        if ('errorType' in singleSykmelding) {
            throw Error(`Fetch by ID failed, expected OK but had error: ${singleSykmelding.errorType}`)
        }

        if (singleSykmelding.kind === 'redacted') {
            throw Error(`Fetch by ID failed, expected full sykmelding but got redacted`)
        }

        expect(singleSykmelding.sykmeldingId).toEqual(opprettResult.sykmeldingId)
        expect(singleSykmelding.values.hoveddiagnose?.system).toEqual(payload.values.hoveddiagnose.system)
        expect(singleSykmelding.values.hoveddiagnose?.system).toEqual(payload.values.hoveddiagnose.system)
    })

    it('GET /sykmelding/<id> should get redacted sykmelding when HPR differs', async () => {
        const payload = createFullOpprettSykmeldingPayload()
        const opprettResult = await sykInnApiService.opprettSykmelding(payload)

        if ('errorType' in opprettResult) {
            throw Error(`Opprett failed, expected OK but had error: ${opprettResult.errorType}`)
        }

        const singleSykmelding = await sykInnApiService.getSykmelding(opprettResult.sykmeldingId, 'other-hpr')

        if ('errorType' in singleSykmelding) {
            throw Error(`Fetch by ID failed, expected OK but had error: ${singleSykmelding.errorType}`)
        }

        if (singleSykmelding.kind === 'full') {
            throw Error(`Fetch by ID failed, expected redacted sykmelding but got full`)
        }

        expect(singleSykmelding.sykmeldingId).toEqual(opprettResult.sykmeldingId)
        expect(singleSykmelding.values.aktivitet).toHaveLength(2)
        expect(Object.keys(singleSykmelding.values)).toHaveLength(1)
    })

    it('GET /sykmelding should return list of sykmeldinger', async () => {
        const payload1 = createFullOpprettSykmeldingPayload()
        const payload2 = createFullOpprettSykmeldingPayload()
        const [opprettet1, opprettet2] = await Promise.all([
            sykInnApiService.opprettSykmelding(payload1),
            sykInnApiService.opprettSykmelding(payload2),
        ])

        if ('errorType' in opprettet1 || 'errorType' in opprettet2) {
            const errors = `1: ${'errorType' in opprettet1 ? opprettet1.errorType : 'OK'}, 2: ${'errorType' in opprettet2 ? opprettet2.errorType : 'OK'}`
            throw Error(`Opprett failed, expected OK but had error, ${errors}`)
        }

        const sykmeldinger = await sykInnApiService.getSykmeldinger(
            payload1.meta.pasientIdent,
            payload1.meta.sykmelderHpr,
        )

        if ('errorType' in sykmeldinger) {
            throw Error(`Fetch all sykmeldinger failed, expected OK but had error: ${sykmeldinger.errorType}`)
        }

        const onlyNew = sykmeldinger.filter(
            (it) => it.sykmeldingId === opprettet1.sykmeldingId || it.sykmeldingId === opprettet2.sykmeldingId,
        )

        expect(onlyNew).toHaveLength(2)
        expect(onlyNew[0].kind).toEqual('full')
        expect(onlyNew[1].kind).toEqual('full')
    })

    it('GET /sykmelding should return list of sykmeldinger mixed with full and redacted', async () => {
        const opprettet1 = await sykInnApiService.opprettSykmelding(
            createFullOpprettSykmeldingPayload({ pasientIdent: '02020221155', sykmelderHpr: 'oneth' }),
        )
        const opprettet2 = await sykInnApiService.opprettSykmelding(
            createFullOpprettSykmeldingPayload({ pasientIdent: '02020221155', sykmelderHpr: 'twoth' }),
        )

        if ('errorType' in opprettet1 || 'errorType' in opprettet2) {
            const errors = `1: ${'errorType' in opprettet1 ? opprettet1.errorType : 'OK'}, 2: ${'errorType' in opprettet2 ? opprettet2.errorType : 'OK'}`
            throw Error(`Opprett failed, expected OK but had error, ${errors}`)
        }

        const sykmeldinger = await sykInnApiService.getSykmeldinger('02020221155', 'oneth')

        if ('errorType' in sykmeldinger) {
            throw Error(`Fetch all sykmeldinger failed, expected OK but had error: ${sykmeldinger.errorType}`)
        }

        const onlyNew = R.pipe(
            sykmeldinger,
            R.filter(
                (it) => it.sykmeldingId === opprettet1.sykmeldingId || it.sykmeldingId === opprettet2.sykmeldingId,
            ),
            R.sortBy((it) => it.meta.mottatt),
        )

        expect(onlyNew).toHaveLength(2)
        expect(onlyNew[0].kind).toEqual('full')
        expect(onlyNew[1].kind).toEqual('redacted')
    })

    it('GET /sykmelding/<id>/pdf should get PDF', async () => {
        const payload = createFullOpprettSykmeldingPayload()
        const opprettResult = await sykInnApiService.opprettSykmelding(payload)

        if ('errorType' in opprettResult) {
            throw Error(`Opprett failed, expected OK but had error: ${opprettResult.errorType}`)
        }

        const pdf = await sykInnApiService.getSykmeldingPdf(opprettResult.sykmeldingId, payload.meta.sykmelderHpr)

        if ('errorType' in pdf) {
            throw Error(`Fetch PDF by ID failed, expected OK but had error: ${pdf.errorType}`)
        }

        expect(pdf.byteLength).toBeGreaterThan(1000)
    }, 10_000)

    it('GET /sykmelding/<id>/pdf not get PDF that does not belong to HPR', async () => {
        const payload = createFullOpprettSykmeldingPayload()
        const opprettResult = await sykInnApiService.opprettSykmelding(payload)

        if ('errorType' in opprettResult) {
            throw Error(`Opprett failed, expected OK but had error: ${opprettResult.errorType}`)
        }

        const pdf = await sykInnApiService.getSykmeldingPdf(opprettResult.sykmeldingId, 'wrong-hpr')

        if (!('errorType' in pdf)) {
            throw Error(`Expected error when trying to fetch PDF with wrong HPR, but got PDF of size ${pdf.byteLength}`)
        }

        expect(pdf.errorType).toEqual('SYKMELDING_PDF_FORBIDDEN')
    })
})

const createFullOpprettSykmeldingPayload = (
    metaOverrides?: Partial<OpprettSykmeldingMeta>,
    valueOverrides?: Partial<OpprettSykmeldingPayload['values']>,
    submitId: string = crypto.randomUUID(),
): OpprettSykmeldingPayload => ({
    submitId: submitId,
    meta: {
        source: `syk-inn test`,
        sykmelderHpr: '123456',
        pasientIdent: '01010112345',
        legekontorOrgnr: '987654321',
        legekontorTlf: '+4712345678',
        ...metaOverrides,
    },
    values: {
        pasientenSkalSkjermes: true,
        hoveddiagnose: { system: 'ICPC2', code: 'P74' },
        bidiagnoser: [{ system: 'ICPC2', code: 'P17' }],
        aktivitet: [
            {
                type: 'AKTIVITET_IKKE_MULIG',
                fom: today(),
                tom: inDays(14),
                medisinskArsak: { isMedisinskArsak: true },
                arbeidsrelatertArsak: {
                    isArbeidsrelatertArsak: true,
                    arbeidsrelaterteArsaker: ['TILRETTELEGGING_IKKE_MULIG', 'ANNET'],
                    annenArbeidsrelatertArsak: 'Trenger tilrettelegging',
                },
            },
            { type: 'GRADERT', fom: inDays(15), tom: inDays(30), grad: 60, reisetilskudd: false },
        ],
        meldinger: { tilNav: 'Dette er en melding til Nav', tilArbeidsgiver: 'Dette er en melding til arbeidsgiver' },
        svangerskapsrelatert: true,
        yrkesskade: { yrkesskade: true, skadedato: daysAgo(3) },
        arbeidsgiver: { arbeidsgivernavn: 'Test Testere AS' },
        tilbakedatering: { begrunnelse: 'Vært i koma', startdato: daysAgo(3) },
        utdypendeSporsmal: {
            utfordringerMedArbeid: 'Kan ikke sitte lenge',
            medisinskOppsummering: 'Pasienten har influensa',
            hensynPaArbeidsplassen: 'Trenger ro og hvile',
            behandlingOgFremtidigArbeid: 'Masse behandling nødvendig',
            forventetHelsetilstandUtvikling: 'Forventes å bli bedre innen kort tid',
            helserelatertUtfordringArbeidssituasjon: 'Har utfordringer relatert til helse',
            medisinskeHensyn: 'Trenger spesielle medisinske hensyn',
            realistiskArbeidshverdag: 'Kan jobbe 50% i en realistisk arbeidshverdag',
            sisteMedisinskeOppsummering: 'Pasienten er nå friskmeldt',
            sykdomsutvikling: 'Forverret seg de siste dagene',
            uavklarteForhold: 'Noen uavklarte forhold gjenstår',
        },
        annenFravarsgrunn: 'BEHANDLING_STERILISERING' satisfies AnnenFravarsgrunnArsak,
        ...valueOverrides,
    },
})

export type KafkaUtdypendeSporsmal = {
    svar: string
    type: string
    skjermetForArbeidsgiver: boolean
}
