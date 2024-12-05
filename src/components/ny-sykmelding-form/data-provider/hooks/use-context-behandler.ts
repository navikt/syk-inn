import { useNySykmeldingDataService } from '../NySykmeldingFormDataProvider'
import { BehandlerInfo } from '../NySykmeldingFormDataService'

export function useContextBehandler(): BehandlerInfo {
    const dataService = useNySykmeldingDataService()

    return dataService.context.behandler
}
