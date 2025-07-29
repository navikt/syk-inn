'use client'

import dynamic from 'next/dynamic'

export const LazyDevTools = dynamic(() => import('./DevTools'), { ssr: false })
