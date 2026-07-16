import dynamic from 'next/dynamic'

export const DevGcpScenariosSectionLazy = dynamic(
    () => import('./DevGcpScenariosSection').then((mod) => mod.DevGcpScenariosSection),
    { ssr: false },
)
