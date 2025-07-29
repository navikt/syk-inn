import { useEffect, useRef } from 'react'

type IntervalFunction = () => unknown | void

function useInterval(callback: IntervalFunction, delay: number): void {
    const savedCallback = useRef<IntervalFunction | null>(null)

    useEffect(() => {
        savedCallback.current = callback
    })

    useEffect(() => {
        const tick = (): void => {
            if (savedCallback.current !== null) {
                savedCallback.current()
            }
        }

        const id = setInterval(tick, delay)
        return () => clearInterval(id)
    }, [delay])
}

export default useInterval
