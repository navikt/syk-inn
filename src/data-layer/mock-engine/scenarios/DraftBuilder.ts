import { subMinutes } from 'date-fns'

import { DraftOwnership } from '../../draft/draft-client'
import { DraftValues } from '../../draft/draft-schema'

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
            svangerskapsrelatert: null,
            tilbakedatering: null,
            yrkesskade: null,
            meldinger: null,
        }
        this._lastUpdated = new Date()
    }

    lastUpdated(minutesAgo: number): DraftBuilder {
        this._lastUpdated = subMinutes(new Date(), minutesAgo)
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
