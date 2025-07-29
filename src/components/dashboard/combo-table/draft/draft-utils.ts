import { isValid, parseISO } from 'date-fns'

import { toReadableDate, toReadableDatePeriod } from '@lib/date'
import { DraftValues } from '@data-layer/draft/draft-schema'

export function draftPeriodeText(perioder: { fom: string | null; tom: string | null }[] | null | undefined): string {
    if (!perioder || perioder.length === 0) {
        return `Ingen periode`
    }

    const firstPeriodFom = perioder[0].fom
    const lastPeriodTom = perioder[perioder.length - 1].tom
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
    }
}

export function draftArbeidsforholdText(arbeidsforhold: DraftValues['arbeidsforhold'] | undefined): string | null {
    if (!arbeidsforhold) {
        return null
    }

    return arbeidsforhold.sykmeldtFraArbeidsforhold ? arbeidsforhold.sykmeldtFraArbeidsforhold : null
}
