import dynamic from 'next/dynamic'

export const WelcomeModal = dynamic(() => import('./InfoNySykmeldingModal').then((it) => it.InfoNySykmeldingModal), {
    ssr: false,
})
