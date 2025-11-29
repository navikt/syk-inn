import { ReactElement, PropsWithChildren, FormHTMLAttributes, DetailedHTMLProps } from 'react'
import * as R from 'remeda'

import { cn } from '@lib/tw'

import styles from './TwoPaneGrid.module.css'

type Props =
    | ({ tag: 'div' } & DetailedHTMLProps<FormHTMLAttributes<HTMLDivElement>, HTMLDivElement>)
    | ({ tag: 'form' } & DetailedHTMLProps<FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>)

function TwoPaneGrid({ children, className, ...props }: PropsWithChildren<Props>): ReactElement {
    if (props.tag === 'div') {
        return (
            <div className={cn(styles.twoPaneGrid, className)} {...R.omit(props, ['tag'])}>
                {children}
            </div>
        )
    }

    return (
        <form className={cn(styles.twoPaneGrid, className)} {...R.omit(props, ['tag'])}>
            {children}
        </form>
    )
}

export default TwoPaneGrid
