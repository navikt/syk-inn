import { addDays } from 'date-fns'

import {
    SykInnApiAktivitet,
    SykInnApiAktivitetIkkeMulig,
    SykInnApiSykmelding,
    SykInnApiSykmeldingRedacted,
    SykInnApiSykmeldingRedactedSchema,
} from '@core/services/syk-inn-api/schema/sykmelding'
import { dateOnly } from '@lib/date'
import { questionTexts } from '@data-layer/common/questions'

export class SykmeldingBuilder {
    private readonly mottatt: string = '2020-02-01'
    private readonly _sykmelding: SykInnApiSykmelding = {
        kind: 'full',
        sykmeldingId: 'sykmelding-id',
        utfall: {
            result: 'OK',
            melding: null,
        },
        meta: {
            mottatt: this.mottatt,
            legekontorOrgnr: '123456789',
            legekontorTlf: '+47 123 45 678',
            pasientIdent: '21037712323',
            sykmelder: {
                hprNummer: '123456',
                fornavn: 'Kari',
                mellomnavn: 'Nordmann',
                etternavn: 'Lege',
            },
        },
        values: {
            arbeidsgiver: {
                harFlere: true,
                arbeidsgivernavn: 'Default AS',
            },
            aktivitet: [],
            hoveddiagnose: {
                system: 'ICPC2',
                code: 'K24',
                text: 'Eksempeldiagnose 1',
            },
            bidiagnoser: [],
            svangerskapsrelatert: false,
            yrkesskade: null,
            tilbakedatering: null,
            pasientenSkalSkjermes: false,
            meldinger: {
                tilNav: null,
                tilArbeidsgiver: null,
            },
            utdypendeSporsmal: null,
            utdypendeSporsmalSvar: null,
            annenFravarsgrunn: null,
        },
    }

    constructor(mottatt: string | { offset: number } = '2020-01-01', id: string = crypto.randomUUID()) {
        this._sykmelding.sykmeldingId = id
        if (typeof mottatt === 'string') {
            this.mottatt = mottatt
            this._sykmelding.meta.mottatt = mottatt
        } else {
            const mottattDate = dateOnly(addDays(new Date(), mottatt.offset))
            this.mottatt = mottattDate
            this._sykmelding.meta.mottatt = mottattDate
        }
    }

    aktivitet(periode: SykInnApiAktivitet): SykmeldingBuilder {
        this._sykmelding.values.aktivitet.push(periode)

        return this
    }

    utdypendeSporsmal(sporsmal: SykInnApiSykmelding['values']['utdypendeSporsmalSvar']): SykmeldingBuilder {
        this._sykmelding.values.utdypendeSporsmalSvar = sporsmal

        return this
    }

    relativeAktivitet(
        aktivitet: Omit<SykInnApiAktivitet, 'fom' | 'tom'>,
        time: { offset: number; days: number },
    ): SykmeldingBuilder {
        const periodeWithDates = {
            ...aktivitet,
            fom: dateOnly(addDays(this.mottatt, time.offset)),
            tom: dateOnly(addDays(this.mottatt, time.offset + time.days)),
        } as SykInnApiAktivitet

        this.aktivitet(periodeWithDates)

        return this
    }

    enkelAktivitet(relative: { offset: number; days: number } = { offset: 0, days: 7 }): SykmeldingBuilder {
        const aktivitet: Omit<SykInnApiAktivitetIkkeMulig, 'fom' | 'tom'> = {
            type: 'AKTIVITET_IKKE_MULIG',
            medisinskArsak: { isMedisinskArsak: false },
            arbeidsrelatertArsak: {
                isArbeidsrelatertArsak: false,
                arbeidsrelaterteArsaker: [],
                annenArbeidsrelatertArsak: null,
            },
        }

        return this.relativeAktivitet(aktivitet, relative)
    }

    uke7Answered(): SykmeldingBuilder {
        const utdypendeSporsmal: SykInnApiSykmelding['values']['utdypendeSporsmalSvar'] = {
            utfordringerMedArbeid: {
                sporsmalstekst: questionTexts.utdypendeSporsmal.utfordringerMedArbeid.label,
                svar: 'Utfordringer med arbeid',
            },
            medisinskOppsummering: {
                sporsmalstekst: questionTexts.utdypendeSporsmal.medisinskOppsummering.label,
                svar: 'Medisinsk oppsummering',
            },
            hensynPaArbeidsplassen: {
                sporsmalstekst: questionTexts.utdypendeSporsmal.hensynPaArbeidsplassen.label,
                svar: 'Hensyn på arbeidsplassen',
            },
            sykdomsutvikling: null,
            arbeidsrelaterteUtfordringer: null,
            behandlingOgFremtidigArbeid: null,
            uavklarteForhold: null,
            oppdatertMedisinskStatus: null,
            realistiskMestringArbeid: null,
            forventetHelsetilstandUtvikling: null,
            medisinskeHensyn: null,
        }

        this.utdypendeSporsmal(utdypendeSporsmal)
        return this
    }

    uke17Answered(): SykmeldingBuilder {
        const utdypendeSporsmal: SykInnApiSykmelding['values']['utdypendeSporsmalSvar'] = {
            utfordringerMedArbeid: null,
            medisinskOppsummering: null,
            hensynPaArbeidsplassen: null,
            sykdomsutvikling: {
                sporsmalstekst: questionTexts.utdypendeSporsmal.sykdomsutvikling.label,
                svar: 'Sykdomsutvikling',
            },
            arbeidsrelaterteUtfordringer: {
                sporsmalstekst: questionTexts.utdypendeSporsmal.arbeidsrelaterteUtfordringer.label,
                svar: 'Arbeidsrelaterte utfordringer',
            },
            behandlingOgFremtidigArbeid: {
                sporsmalstekst: questionTexts.utdypendeSporsmal.behandlingOgFremtidigArbeid.label,
                svar: 'Behandling og fremtidig arbeid',
            },
            uavklarteForhold: {
                sporsmalstekst: questionTexts.utdypendeSporsmal.uavklarteForhold.label,
                svar: 'Uavklarte forhold',
            },
            oppdatertMedisinskStatus: null,
            realistiskMestringArbeid: null,
            forventetHelsetilstandUtvikling: null,
            medisinskeHensyn: null,
        }

        this.utdypendeSporsmal(utdypendeSporsmal)
        return this
    }

    build(): SykInnApiSykmelding {
        if (this._sykmelding.values.aktivitet.length === 0) {
            throw new Error('Sykmelding må ha minst en aktivitet! Dumbass >:(')
        }

        return this._sykmelding
    }

    buildRedacted(): SykInnApiSykmeldingRedacted {
        if (this._sykmelding.values.aktivitet.length === 0) {
            throw new Error('Sykmelding må ha minst en aktivitet! Dumbass >:(')
        }

        return SykInnApiSykmeldingRedactedSchema.parse(this._sykmelding)
    }
}
