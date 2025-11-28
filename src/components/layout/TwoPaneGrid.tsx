import { ReactElement, PropsWithChildren, FormHTMLAttributes, DetailedHTMLProps } from 'react'
import * as R from 'remeda'

import styles from './TwoPaneGrid.module.css'

type Props =
    | ({ tag: 'div' } & DetailedHTMLProps<FormHTMLAttributes<HTMLDivElement>, HTMLDivElement>)
    | ({ tag: 'form' } & DetailedHTMLProps<FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>)

function TwoPaneGrid({ children, ...props }: PropsWithChildren<Props>): ReactElement {
    if (props.tag === 'div') {
        return (
            <div className={styles.twoPaneGrid} {...R.omit(props, ['tag'])}>
                {children}
            </div>
        )
    }

    return (
        <form className={styles.twoPaneGrid} {...R.omit(props, ['tag'])}>
            {children}
        </form>
    )
}

export default TwoPaneGrid
