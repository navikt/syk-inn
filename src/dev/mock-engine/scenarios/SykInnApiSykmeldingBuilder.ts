import { addDays } from 'date-fns'

import {
    SykInnApiAktivitet,
    SykInnApiAktivitetIkkeMulig,
    SykInnApiSykmelding,
    SykInnApiSykmeldingRedacted,
    SykInnApiSykmeldingRedactedSchema,
} from '@core/services/syk-inn-api/schema/sykmelding'
import { dateOnly } from '@lib/date'

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
