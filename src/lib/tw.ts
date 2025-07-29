import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...names: Parameters<typeof clsx>): string {
    return twMerge(clsx(...names))
}
