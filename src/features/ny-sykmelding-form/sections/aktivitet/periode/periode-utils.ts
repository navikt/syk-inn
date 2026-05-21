import { format, isSameDay } from 'date-fns'
import { nb } from 'date-fns/locale/nb'

import { toReadablePeriodLength } from '@lib/date'

export function getRangeDescription(
    fom: Date | string | null | undefined,
    tom: Date | string | null | undefined,
): { top: string; bottom: string } | null {
    if (fom == null || tom == null || fom === '' || tom === '') {
        return null
    }

    const isFomToday = isSameDay(fom, new Date())
    const isTomToday = isSameDay(tom, new Date())

    return {
        top: toReadablePeriodLength(fom, tom),
        bottom: `Fra ${format(fom, 'EEEE d. MMMM', { locale: nb })}${isFomToday ? ' (i dag)' : ''} til ${format(tom, 'EEEE d. MMMM', { locale: nb })}${isTomToday ? ' (i dag)' : ''}`,
    }
}
