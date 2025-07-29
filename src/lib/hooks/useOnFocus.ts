import { useEffect, useRef } from 'react'

import useWindowFocus from './useWindowFocus'

function useOnFocus(callback: () => void): void {
    const focus = useWindowFocus()
    const initialLoad = useRef<boolean>(true)

    useEffect(() => {
        // Don't invoke the callback on the initial load, only subsequent focus changes
        if (initialLoad.current) {
            initialLoad.current = false
            return
        }

        if (focus) callback()
    }, [focus, callback])
}

export default useOnFocus
