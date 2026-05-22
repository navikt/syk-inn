import { format, isSameDay } from 'date-fns'
import { nb } from 'date-fns/locale/nb'

import { toReadablePeriodLength } from '@lib/date'

export function defaultRangeDescription(fom: Date | string, tom: Date | string): { main: string; detail: string } {
    const isFomToday = isSameDay(fom, new Date())
    const isTomToday = isSameDay(tom, new Date())

    return {
        main: toReadablePeriodLength(fom, tom),
        detail: `Fra ${format(fom, 'EEEE d. MMMM', { locale: nb })}${isFomToday ? ' (i dag)' : ''} til ${format(tom, 'EEEE d. MMMM', { locale: nb })}${isTomToday ? ' (i dag)' : ''}`,
    }
}
