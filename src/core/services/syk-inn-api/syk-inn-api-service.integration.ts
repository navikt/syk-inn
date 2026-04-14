import { beforeAll, describe, it, expect } from 'vitest'
import { StartedTestContainer } from 'testcontainers'
import { Kafka } from 'kafkajs'
import * as R from 'remeda'

import { initializeSykInnApi } from '@lib/test/syk-inn-api'
import { sykInnApiService } from '@core/services/syk-inn-api/syk-inn-api-service'
import { OpprettSykmeldingMeta, OpprettSykmeldingPayload } from '@core/services/syk-inn-api/schema/opprett'
import { initializeValkey } from '@lib/test/valkey'
import { daysAgo, inDays, today } from '@lib/test/date-utils'
import { consumeUntil, initializeConsumer, initializeKafka, initializeLocalKafka } from '@lib/test/syk-inn-kafka'
import { AnnenFravarsgrunnArsak } from '@resolvers'
import { questionTexts } from '@data-layer/common/questions'
import { KafkaAktivitetIkkeMulig, KafkaGradert } from '@lib/test/syk-inn-kafka-types'

/**
 * Can be manually toggled to run tests with local (already running syk-inn-api)
 */
const useLocalSykInnApi = process.env.LOCAL_SYK != null

describe('SykInnApi integration', () => {
    let sykInnApi: StartedTestContainer
    let valkey: StartedTestContainer
    let kafka: Kafka

    beforeAll(async () => {
        valkey = await initializeValkey()

        if (useLocalSykInnApi) {
            process.env.LOCAL_SYK_INN_API_HOST = `localhost:8080`
            kafka = await initializeLocalKafka()
        } else {
            const sykInnContainers = await initializeSykInnApi(false)
            sykInnApi = sykInnContainers.sykInnApi
            kafka = await initializeKafka(sykInnContainers.kafka)

            process.env.LOCAL_SYK_INN_API_HOST = `${sykInnApi.getHost()}:${sykInnApi.getMappedPort(8080)}`
        }

        process.env.VALKEY_HOST_SYK_INN = `${valkey.getHost()}:${valkey.getMappedPort(6379)}`
    }, 60_000)

    it('sanity check health endpoint', async () => {
        const healthResponse = await fetch(`http://${process.env.LOCAL_SYK_INN_API_HOST}/internal/health/alive`)

        expect(healthResponse.status).toEqual(200)
    })

    it('POST /sykmelding/verify should be able to verify with all values', async () => {
        const opprettResult = await sykInnApiService.verifySykmelding(createFullOpprettSykmeldingPayload())

        expect(R.prop(opprettResult, 'status')).toBe('OK')
    })

    it('POST /sykmelding/verify should inform that patient does not exist', async () => {
        const opprettResult = await sykInnApiService.verifySykmelding(
            createFullOpprettSykmeldingPayload({
                pasientIdent: 'does-not-exist',
            }),
        )

        if ('status' in opprettResult && opprettResult.status === 'OK') {
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
            utdypendeSporsmal: {
                utfordringerMedArbeid: {
                    sporsmalstekst: questionTexts.utdypendeSporsmal.utfordringerMedArbeid.label,
                    svar: 'Kan ikke sitte lenge',
                },
                medisinskOppsummering: {
                    sporsmalstekst: questionTexts.utdypendeSporsmal.medisinskOppsummering.label,
                    svar: 'Pasienten har influensa',
                },
                hensynPaArbeidsplassen: {
                    sporsmalstekst: questionTexts.utdypendeSporsmal.hensynPaArbeidsplassen.label,
                    svar: 'Trenger ro og hvile',
                },
                sykdomsutvikling: {
                    sporsmalstekst: questionTexts.utdypendeSporsmal.sykdomsutvikling.label,
                    svar: 'Sykdommen har forverret seg',
                },
                arbeidsrelaterteUtfordringer: {
                    sporsmalstekst: questionTexts.utdypendeSporsmal.arbeidsrelaterteUtfordringer.label,
                    svar: 'Kan ikke utføre arbeidsoppgaver',
                },
                behandlingOgFremtidigArbeid: {
                    sporsmalstekst: questionTexts.utdypendeSporsmal.behandlingOgFremtidigArbeid.label,
                    svar: 'Behandling pågår',
                },
                uavklarteForhold: {
                    sporsmalstekst: questionTexts.utdypendeSporsmal.uavklarteForhold.label,
                    svar: 'Uavklarte sosiale forhold',
                },
                oppdatertMedisinskStatus: {
                    sporsmalstekst: questionTexts.utdypendeSporsmal.oppdatertMedisinskStatus.label,
                    svar: 'Medisinsk status er uendret',
                },
                realistiskMestringArbeid: {
                    sporsmalstekst: questionTexts.utdypendeSporsmal.realistiskMestringArbeid.label,
                    svar: 'Pasienten kan mestre noe arbeid',
                },
                forventetHelsetilstandUtvikling: {
                    sporsmalstekst: questionTexts.utdypendeSporsmal.forventetHelsetilstandUtvikling.label,
                    svar: 'Forventet bedring innen tre måneder',
                },
                medisinskeHensyn: {
                    sporsmalstekst: questionTexts.utdypendeSporsmal.medisinskeHensyn.label,
                    svar: 'Må unngå støy og stress',
                },
            },
        })

        const opprettResult = await sykInnApiService.opprettSykmelding(payload)
        if ('errorType' in opprettResult) {
            throw Error(`Opprett failed, expected OK but had error: ${opprettResult.errorType}`)
        }

        expect(opprettResult.sykmeldingId).toBeDefined()

        const consumer = await initializeConsumer(kafka)
        const kafkaMessage = await consumeUntil(consumer, opprettResult.sykmeldingId)

        // metadata
        expect.soft(kafkaMessage.metadata.type).toEqual('DIGITAL')
        expect.soft(kafkaMessage.metadata.orgnummer).toEqual('987654321')

        // sykmelding metadata
        expect.soft(kafkaMessage.sykmelding.metadata.avsenderSystem.navn).toEqual('syk-inn test')

        // pasient
        expect.soft(kafkaMessage.sykmelding.pasient.fnr).toEqual('01010112345')

        // behandler
        expect.soft(kafkaMessage.sykmelding.sykmelder.helsepersonellKategori).toEqual('LEGE')

        // medisinskVurdering - diagnoses
        expect.soft(kafkaMessage.sykmelding.medisinskVurdering.hovedDiagnose.system).toEqual('ICPC2B')
        expect.soft(kafkaMessage.sykmelding.medisinskVurdering.hovedDiagnose.kode).toEqual('T99.0084')
        expect.soft(kafkaMessage.sykmelding.medisinskVurdering.biDiagnoser[0].system).toEqual('ICPC2')
        expect.soft(kafkaMessage.sykmelding.medisinskVurdering.biDiagnoser[0].kode).toEqual('D97')
        expect.soft(kafkaMessage.sykmelding.medisinskVurdering.biDiagnoser).toHaveLength(1)

        // medisinskVurdering - remaining fields
        expect.soft(kafkaMessage.sykmelding.medisinskVurdering.svangerskap).toBe(true)
        expect.soft(kafkaMessage.sykmelding.medisinskVurdering.skjermetForPasient).toBe(true)
        expect.soft(kafkaMessage.sykmelding.medisinskVurdering.yrkesskade).not.toBeNull()
        expect.soft(kafkaMessage.sykmelding.medisinskVurdering.yrkesskade?.yrkesskadeDato).toBeDefined()
        expect.soft(kafkaMessage.sykmelding.medisinskVurdering.annenFravarsgrunn).toEqual('BEHANDLING_STERILISERING')

        // aktivitet
        expect.soft(kafkaMessage.sykmelding.aktivitet).toHaveLength(2)
        const aktivitetIkkeMulig = kafkaMessage.sykmelding.aktivitet.find(
            (it) => it.type === 'AKTIVITET_IKKE_MULIG',
        ) as KafkaAktivitetIkkeMulig
        expect.soft(aktivitetIkkeMulig).toBeDefined()
        // Deprecated value, defaults to null on kafka
        expect.soft(aktivitetIkkeMulig.medisinskArsak).toBeNull()
        expect.soft(aktivitetIkkeMulig.arbeidsrelatertArsak).not.toBeNull()
        expect.soft(aktivitetIkkeMulig.arbeidsrelatertArsak?.arsak).toContain('MANGLENDE_TILRETTELEGGING')
        expect.soft(aktivitetIkkeMulig.arbeidsrelatertArsak?.arsak).toContain('ANNET')
        expect.soft(aktivitetIkkeMulig.arbeidsrelatertArsak?.beskrivelse).toEqual('Trenger tilrettelegging')
        const gradert = kafkaMessage.sykmelding.aktivitet.find((it) => it.type === 'GRADERT') as KafkaGradert
        expect.soft(gradert).toBeDefined()
        expect.soft(gradert.grad).toEqual(60)
        expect.soft(gradert.reisetilskudd).toBe(false)

        // arbeidsgiver
        expect.soft(kafkaMessage.sykmelding.arbeidsgiver.type).toEqual('FLERE_ARBEIDSGIVERE')
        expect.soft(kafkaMessage.sykmelding.arbeidsgiver.navn).toEqual('Test Testere AS')
        expect
            .soft(kafkaMessage.sykmelding.arbeidsgiver.meldingTilArbeidsgiver)
            .toEqual('Dette er en melding til arbeidsgiver')

        // tilbakedatering
        expect.soft(kafkaMessage.sykmelding.tilbakedatering).not.toBeNull()
        expect.soft(kafkaMessage.sykmelding.tilbakedatering?.begrunnelse).toEqual('Vært i koma')
        expect.soft(kafkaMessage.sykmelding.tilbakedatering?.kontaktDato).toBeDefined()

        // bistandNav (melding til Nav)
        expect.soft(kafkaMessage.sykmelding.bistandNav).not.toBeNull()
        expect.soft(kafkaMessage.sykmelding.bistandNav?.beskrivBistand).toEqual('Dette er en melding til Nav')

        // utdypendeSporsmal - all 11 entries (MEDISINSK_OPPSUMMERING and UTFORDRINGER_MED_ARBEID are shared by multiple fields)
        const utdypendeSporsmal = kafkaMessage.sykmelding.utdypendeSporsmal
        expect.soft(utdypendeSporsmal).toBeDefined()
        expect.soft(utdypendeSporsmal).toHaveLength(11)

        // Unique types
        expect
            .soft(utdypendeSporsmal?.find((it) => it.type === 'UTFORDRINGER_MED_GRADERT_ARBEID')?.svar)
            .toEqual('Kan ikke sitte lenge')
        expect
            .soft(utdypendeSporsmal?.find((it) => it.type === 'HENSYN_PA_ARBEIDSPLASSEN')?.svar)
            .toEqual('Trenger ro og hvile')
        expect
            .soft(utdypendeSporsmal?.find((it) => it.type === 'BEHANDLING_OG_FREMTIDIG_ARBEID')?.svar)
            .toEqual('Behandling pågår')
        expect
            .soft(utdypendeSporsmal?.find((it) => it.type === 'UAVKLARTE_FORHOLD')?.svar)
            .toEqual('Uavklarte sosiale forhold')
        expect
            .soft(utdypendeSporsmal?.find((it) => it.type === 'FORVENTET_HELSETILSTAND_UTVIKLING')?.svar)
            .toEqual('Forventet bedring innen tre måneder')
        expect
            .soft(utdypendeSporsmal?.find((it) => it.type === 'MEDISINSKE_HENSYN')?.svar)
            .toEqual('Må unngå støy og stress')

        const medisinskOppsummeringer = utdypendeSporsmal
            ?.filter((it) => it.type === 'MEDISINSK_OPPSUMMERING')
            .map((it) => it.svar)
        expect.soft(medisinskOppsummeringer).toHaveLength(3)
        expect.soft(medisinskOppsummeringer).toContain('Pasienten har influensa')
        expect.soft(medisinskOppsummeringer).toContain('Sykdommen har forverret seg')
        expect.soft(medisinskOppsummeringer).toContain('Medisinsk status er uendret')

        const utfordringerMedArbeidEntries = utdypendeSporsmal
            ?.filter((it) => it.type === 'UTFORDRINGER_MED_ARBEID')
            .map((it) => it.svar)
        expect.soft(utfordringerMedArbeidEntries).toHaveLength(2)
        expect.soft(utfordringerMedArbeidEntries).toContain('Kan ikke utføre arbeidsoppgaver')
        expect.soft(utfordringerMedArbeidEntries).toContain('Pasienten kan mestre noe arbeid')
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
                arbeidsrelatertArsak: {
                    isArbeidsrelatertArsak: true,
                    arbeidsrelaterteArsaker: ['MANGLENDE_TILRETTELEGGING', 'ANNET'],
                    annenArbeidsrelatertArsak: 'Trenger tilrettelegging',
                },
            },
            { type: 'GRADERT', fom: inDays(15), tom: inDays(30), grad: 60, reisetilskudd: false },
        ],
        meldinger: { tilNav: 'Dette er en melding til Nav', tilArbeidsgiver: 'Dette er en melding til arbeidsgiver' },
        svangerskapsrelatert: true,
        yrkesskade: { yrkesskade: true, skadedato: daysAgo(3) },
        arbeidsgiver: { harFlere: true, arbeidsgivernavn: 'Test Testere AS' },
        tilbakedatering: { begrunnelse: 'Vært i koma', startdato: daysAgo(3) },
        utdypendeSporsmal: {
            utfordringerMedArbeid: {
                sporsmalstekst: questionTexts.utdypendeSporsmal.utfordringerMedArbeid.label,
                svar: 'Kan ikke sitte lenge',
            },
            medisinskOppsummering: {
                sporsmalstekst: questionTexts.utdypendeSporsmal.medisinskOppsummering.label,
                svar: 'Pasienten har influensa',
            },
            hensynPaArbeidsplassen: {
                sporsmalstekst: questionTexts.utdypendeSporsmal.hensynPaArbeidsplassen.label,
                svar: 'Trenger ro og hvile',
            },
            sykdomsutvikling: null,
            arbeidsrelaterteUtfordringer: null,
            behandlingOgFremtidigArbeid: null,
            uavklarteForhold: null,
            oppdatertMedisinskStatus: null,
            realistiskMestringArbeid: null,
            forventetHelsetilstandUtvikling: null,
            medisinskeHensyn: null,
        },
        annenFravarsgrunn: 'BEHANDLING_STERILISERING' satisfies AnnenFravarsgrunnArsak,
        ...valueOverrides,
    },
})
