import { isValid, parseISO } from 'date-fns'
import * as R from 'remeda'

import { DraftValues } from '#data-layer/draft/draft-schema'
import { toReadableDate, toReadableDatePeriod } from '#lib/date'

export function maybeFom(perioder: DraftValues['perioder']): string | null {
    if (perioder == null || perioder.length === 0) return null

    const [firstPeriode] = perioder
    if (firstPeriode.fom == null) return null

    return firstPeriode.fom
}

export function maybeTom(perioder: DraftValues['perioder']): string | null {
    if (perioder == null || perioder.length === 0) return null

    const lastPeriode = R.last(perioder)
    if (lastPeriode == null || lastPeriode.tom == null) return null

    return lastPeriode.tom
}

export function draftPeriodeText(perioder: DraftValues['perioder'] | undefined): string {
    if (!perioder || perioder.length === 0) {
        return `Ingen periode`
    }

    const firstPeriodFom = maybeFom(perioder)
    const lastPeriodTom = maybeTom(perioder)
    const fomDate = firstPeriodFom ? parseISO(firstPeriodFom) : null
    const tomDate = lastPeriodTom ? parseISO(lastPeriodTom) : null

    // We have no periods, or both are invalid dates
    if ((!fomDate && !tomDate) || (!isValid(fomDate) && !isValid(tomDate))) {
        return `Ingen periode`
    }

    // We have both periods
    if (fomDate && tomDate && isValid(fomDate) && isValid(tomDate)) {
        return `${toReadableDatePeriod(fomDate, tomDate)}`
    }

    // Only fom
    if (fomDate && isValid(fomDate)) {
        return `Fra ${toReadableDate(fomDate)}`
    }

    // Only tom
    if (tomDate && isValid(tomDate)) {
        return `Til ${toReadableDate(tomDate)}`
    }

    // Can't happen (probably)
    return `Ingen periode`
}

export function draftDiagnoseText(hoveddiagnose: DraftValues['hoveddiagnose'] | undefined): string {
    return hoveddiagnose != null ? `${hoveddiagnose.code} - ${hoveddiagnose.text}` : 'Ingen diagnose'
}

export function draftAktivitetText(perioder: DraftValues['perioder'] | undefined): string | null {
    if (!perioder || perioder.length === 0) {
        return null
    }

    const firstPeriod = perioder[0]
    switch (firstPeriod.type) {
        case 'GRADERT':
            return firstPeriod.grad ? `${firstPeriod.grad}%` : null
        case 'AKTIVITET_IKKE_MULIG':
            return '100%'
        case 'BEHANDLINGSDAGER':
            return 'Behandlingsdager'
        case 'REISETILSKUDD':
            return 'Reisetilskudd'
    }
}

export function draftArbeidsforholdText(arbeidsforhold: DraftValues['arbeidsforhold'] | undefined): string | null {
    if (!arbeidsforhold) {
        return null
    }

    return arbeidsforhold.sykmeldtFraArbeidsforhold ? arbeidsforhold.sykmeldtFraArbeidsforhold : null
}
