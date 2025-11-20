import { expect, Page } from '@playwright/test'
import { OpprettSykmeldingMetaInput } from '@queries'

import * as fhirUserVerification from '../../fhir/actions/fhir-user-verifications'
import * as standaloneUserVerification from '../../standalone/actions/standalone-user-verifications'
import * as standaloneActions from '../../standalone/actions/standalone-user-actions'
import { Modes, onMode } from '../modes'

export function verifySignerendeBehandlerFillIfNeeded(mode: Modes): (page: Page) => Promise<void> {
    return onMode(mode, {
        fhir: async (page) => {
            await fhirUserVerification.verifySignerendeBehandler()(page)
        },
        standalone: async (page) => {
            await standaloneUserVerification.verifySignerendeBehandler('123456')(page)
            await standaloneActions.fillOrgnummer('112233445')(page)
            await standaloneActions.fillTelefonnummer('+47 99887766')(page)

            /**
             * Unflake: Make sure the phone interaction is good before continuing
             */
            await expect(page.getByText('+47 99887766 (manuelt)')).toBeVisible()
        },
    })
}
export const expectedSykmeldingMeta = (mode: Modes): OpprettSykmeldingMetaInput =>
    mode === 'FHIR'
        ? { orgnummer: null, legekontorTlf: null }
        : {
              orgnummer: '112233445',
              legekontorTlf: '+47 99887766',
          }
