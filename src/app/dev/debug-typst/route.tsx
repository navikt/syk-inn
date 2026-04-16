import fs from 'node:fs'

import { logger } from '@navikt/next-logger'

import { createTypstSykmelding, mapSykInnToPdfPayload } from '@core/pdf/pdf-service'
import { isLocal } from '@lib/env'
import { TypstPdfSykmelding } from '@core/pdf/types'
import { SykInnApiSykmelding } from '@core/services/syk-inn-api/schema/sykmelding'
import { daysAgo, inDays, today } from '@lib/test/date-utils'
import { questionTexts } from '@data-layer/common/questions'

export async function GET(): Promise<Response> {
    const chonkySykmelding: SykInnApiSykmelding = {
        sykmeldingId: crypto.randomUUID(),
        kind: 'full',
        utfall: { result: 'OK', cause: null },
        meta: {
            mottatt: new Date().toISOString(),
            legekontorOrgnr: '123456789',
            legekontorTlf: '+47 123 45 678',
            pasient: { ident: '21037712323', navn: 'Ola Normann' },
            sykmelder: { hpr: '123456', navn: 'Kari Normann Lege' },
        },
        values: {
            arbeidsgiver: {
                harFlere: true,
                arbeidsgivernavn: 'Default AS',
            },
            aktivitet: [
                {
                    type: 'AKTIVITET_IKKE_MULIG',
                    fom: today(),
                    tom: inDays(14),
                    arbeidsrelatertArsak: {
                        isArbeidsrelatertArsak: true,
                        annenArbeidsrelatertArsak: 'Jadda neida så det',
                        arbeidsrelaterteArsaker: ['MANGLENDE_TILRETTELEGGING', 'ANNET'],
                    },
                },
                {
                    type: 'AKTIVITET_IKKE_MULIG',
                    fom: inDays(15),
                    tom: inDays(30),
                    arbeidsrelatertArsak: {
                        isArbeidsrelatertArsak: true,
                        annenArbeidsrelatertArsak: 'noe annet ikke så lang grunn egt',
                        arbeidsrelaterteArsaker: ['ANNET'],
                    },
                },
                {
                    type: 'GRADERT',
                    fom: inDays(31),
                    tom: inDays(45),
                    grad: 69,
                    reisetilskudd: false,
                },
            ],
            hoveddiagnose: {
                system: 'ICPC2',
                code: 'K24',
                text: 'Eksempeldiagnose 1',
            },
            bidiagnoser: [
                {
                    system: 'ICPC2',
                    code: 'K25',
                    text: 'Eksempeldiagnose 1',
                },
                {
                    system: 'ICPC2',
                    code: 'K26',
                    text: 'Veldig lang deosuatheunstaeo hunsaoethu aeonstu aeonstuaeo sn',
                },
            ],
            svangerskapsrelatert: true,
            yrkesskade: {
                yrkesskade: true,
                skadedato: daysAgo(7),
            },
            tilbakedatering: {
                startdato: daysAgo(30),
                begrunnelse: 'Pasienten var så syk at hen ikke klarte å kontakte legekontoret før nå',
            },
            pasientenSkalSkjermes: true,
            meldinger: {
                tilNav: 'Hei NAV, dette er en melding til dere',
                tilArbeidsgiver:
                    'Hei arbeidsgiver, dette er en melding til dere. Det er veldig viktig at dere leser denne meldingen, for det står nemlig veldig viktige ting her som dere må ta hensyn til når dere skal legge til rette for arbeidstakeren sin retur til jobb etter sykefraværet.',
            },
            utdypendeSporsmal: {
                utfordringerMedArbeid: {
                    sporsmalstekst: questionTexts.utdypendeSporsmal.utfordringerMedArbeid.label,
                    svar: 'Det er mange utfordringer med arbeid, for eksempel at det er veldig langt å reise til jobb, og at det er tunge løft på arbeidsplassen som gjør det vanskelig å komme tilbake til jobb.',
                },
                medisinskOppsummering: {
                    sporsmalstekst: questionTexts.utdypendeSporsmal.medisinskOppsummering.label,
                    svar: 'Medisinsk oppsummering: Pasienten har en kronisk sykdom som gjør det vanskelig å være i arbeid, spesielt når det er mye stress på jobben. Det er viktig at pasienten får tilrettelegging på arbeidsplassen for å kunne komme tilbake til jobb.',
                },
                hensynPaArbeidsplassen: {
                    sporsmalstekst: questionTexts.utdypendeSporsmal.hensynPaArbeidsplassen.label,
                    svar: 'Pasienten trenger mulighet for hyppige pauser, redusert tempo i perioder med smerter og adgang til ergonomisk tilpasset arbeidsutstyr for a kunne sta i arbeid.',
                },
                sykdomsutvikling: {
                    sporsmalstekst: questionTexts.utdypendeSporsmal.sykdomsutvikling.label,
                    svar: 'Tilstanden har utviklet seg gradvis de siste ukene med okende smerter og utmattelse. Det forventes variasjon fra dag til dag, men samlet sett bedring med riktig behandling og avlastning.',
                },
                arbeidsrelaterteUtfordringer: {
                    sporsmalstekst: questionTexts.utdypendeSporsmal.arbeidsrelaterteUtfordringer.label,
                    svar: 'Arbeidet inneholder flere oppgaver med hoy konsentrasjon, tidspress og enkelte tunge arbeidsoperasjoner, noe som forverrer symptomene og gjor full jobbbelasting vanskelig akkurat na.',
                },
                behandlingOgFremtidigArbeid: {
                    sporsmalstekst: questionTexts.utdypendeSporsmal.behandlingOgFremtidigArbeid.label,
                    svar: 'Pasienten folges opp med behandling og forventes gradvis a kunne gjenoppta flere arbeidsoppgaver. Det anbefales tett oppfolging og trinnvis opptrapping i arbeidstiden.',
                },
                uavklarteForhold: {
                    sporsmalstekst: questionTexts.utdypendeSporsmal.uavklarteForhold.label,
                    svar: 'Det er fortsatt noe usikkerhet knyttet til belastningstoleranse og hvor raskt pasienten vil respondere pa behandling, sa funksjonsniva ma vurderes fortlopende.',
                },
                oppdatertMedisinskStatus: {
                    sporsmalstekst: questionTexts.utdypendeSporsmal.oppdatertMedisinskStatus.label,
                    svar: 'Pasienten er medisinsk vurdert pa nytt og har fortsatt nedsatt funksjonsevne. Symptomtrykket er vedvarende, men det er ingen tegn til alvorlig forverring eller behov for innleggelse.',
                },
                realistiskMestringArbeid: {
                    sporsmalstekst: questionTexts.utdypendeSporsmal.realistiskMestringArbeid.label,
                    svar: 'Det vurderes som realistisk at pasienten kan mestre avgrensede og mindre belastende arbeidsoppgaver i redusert omfang, forutsatt god tilrettelegging og fleksibilitet i arbeidshverdagen.',
                },
                forventetHelsetilstandUtvikling: {
                    sporsmalstekst: questionTexts.utdypendeSporsmal.forventetHelsetilstandUtvikling.label,
                    svar: 'Helsetilstanden forventes a bedre seg gradvis over de neste ukene, men forlopet er avhengig av at behandlingen fungerer og at arbeidsbelastningen tilpasses symptomnivaet.',
                },
                medisinskeHensyn: {
                    sporsmalstekst: questionTexts.utdypendeSporsmal.medisinskeHensyn.label,
                    svar: 'Det bor tas medisinske hensyn ved a unnga tunge loft, langvarig statisk belastning og hoyt stressniva. Pasienten har ogsa behov for forutsigbarhet og mulighet for restitusjon i lopet av dagen.',
                },
            },
            annenFravarsgrunn: 'GODKJENT_HELSEINSTITUSJON',
        },
    }

    const body = await createTypstSykmelding(chonkySykmelding)
    if (!body.ok) {
        logger.error(`Unable to generate PDF, typst says: ${body.error}`)
        return new Response('Internal server error', { status: 500 })
    }

    // Update our local test data, used when developing with yarn dev:pdf
    if (isLocal) {
        const payload: TypstPdfSykmelding = mapSykInnToPdfPayload(chonkySykmelding)
        fs.writeFileSync('./typst-pdf/test-data/big.json', JSON.stringify(payload, null, 2))
    }

    return new Response(body.pdf, {
        headers: { 'Content-Type': 'application/pdf' },
        status: 200,
    })
}
