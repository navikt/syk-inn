import { differenceInDays } from 'date-fns'

/**
 * Number of behandlingsdager is in essence one per STARTED week. So 7 days = 1, 8 days = 2, 14 days = 2, 15 days = 3, etc.
 */
export function getNumberOfBehandlingsdager(fom: Date | string, tom: Date | string): number {
    // differenceInDays is non-inclusive in end (or start, dunno lol)
    const numberOfDays = differenceInDays(tom, fom) + 1

    // Round up so any "started" week gets +1
    return Math.ceil(numberOfDays / 7)
}
