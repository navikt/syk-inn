import { addDays, subMinutes } from 'date-fns'

import { getDiagnoseText } from '#data-layer/common/diagnose-search'
import { DraftOwnership } from '#data-layer/draft/draft-client'
import { DraftValues } from '#data-layer/draft/draft-schema'
import { dateOnly } from '#lib/date'

export class DraftBuilder {
    private _id: string
    private _owner: DraftOwnership
    private _values: DraftValues
    private _lastUpdated: Date

    constructor(id: string = crypto.randomUUID()) {
        this._id = id
        // Espen and Magnar
        this._owner = { hpr: '9144889', ident: '21037712323' }
        this._values = {
            arbeidsforhold: null,
            perioder: null,
            hoveddiagnose: null,
            bidiagnoser: [],
            svangerskapsrelatert: null,
            tilbakedatering: null,
            yrkesskade: null,
            meldinger: null,
            utdypendeSporsmal: null,
            annenFravarsgrunn: null,
        }
        this._lastUpdated = new Date()
    }

    lastUpdated(minutesAgo: number): DraftBuilder {
        this._lastUpdated = subMinutes(new Date(), minutesAgo)
        return this
    }

    gradert(grad: number, relative: { offset: number; days: number } = { offset: 0, days: 7 }): DraftBuilder {
        const now = new Date()

        const fom = dateOnly(addDays(now, relative.offset))
        const tom = dateOnly(addDays(now, relative.offset + relative.days))

        this._values.perioder = [
            {
                type: 'GRADERT',
                fom,
                tom,
                grad: grad.toString(),
                gradertReisetilksudd: false,
                arbeidsrelatertArsak: null,
            },
        ]
        return this
    }

    /**
     * ICPC-2
     */
    diagnose(code: string): DraftBuilder {
        const text = getDiagnoseText('ICPC2', code)
        if (text == null) {
            throw Error(`Illegal ICPC-2 mock code: ${code}, does not exist`)
        }

        this._values.hoveddiagnose = { system: 'ICPC2', code, text: text }
        return this
    }

    build(): ScenarioDraft {
        return {
            id: this._id,
            owner: this._owner,
            values: this._values,
            lastUpdated: this._lastUpdated,
        }
    }
}

export type ScenarioDraft = { id: string; lastUpdated: Date; owner: DraftOwnership; values: DraftValues }
