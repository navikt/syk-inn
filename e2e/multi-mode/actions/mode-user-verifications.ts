import { expect, Page, test } from '@playwright/test'

import { OpprettSykmeldingMetaInput } from '#queries'

import * as fhirUserVerification from '../../fhir/actions/fhir-user-verifications'
import * as standaloneActions from '../../standalone/actions/standalone-user-actions'
import * as standaloneUserVerification from '../../standalone/actions/standalone-user-verifications'
import { verifyNoHorizontalScroll } from '../../utils/assertions'
import { Modes, onMode } from '../modes'

export function verifySignerendeBehandlerFillIfNeeded(mode: Modes): (page: Page) => Promise<void> {
    return onMode(mode, {
        fhir: async (page) => {
            await fhirUserVerification.verifySignerendeBehandler()(page)
        },
        standalone: async (page) => {
            await standaloneUserVerification.verifySignerendeBehandler('9144889')(page)
            await standaloneActions.fillOrgnummer('112233445')(page)
            await standaloneActions.fillTelefonnummer('+47 99887766')(page)

            /**
             * Unflake: Make sure the phone interaction is good before continuing
             */
            await expect(page.getByText('+47 99887766 (manuelt)')).toBeVisible()
        },
    })
}
export function verifyIsOnKvitteringPage(mode: Modes) {
    return async (page: Page) => {
        await test.step(`Verify is on kvittering page (${mode})`, async () => {
            await expect(page.getByRole('heading', { name: 'Kvittering på innsendt sykmelding' })).toBeVisible()
            await verifyNoHorizontalScroll()(page)

            await onMode(mode, {
                fhir: async (page) => {
                    await expect(page.getByText('Sykmeldingdokument er lagret i EPJ-systemet')).toBeVisible()
                },
                standalone: async (page) => {
                    await expect(page.getByRole('button', { name: 'Last ned sykmeldingen som PDF' })).toBeVisible()
                },
            })(page)
        })
    }
}

export const expectedSykmeldingMeta = (mode: Modes): OpprettSykmeldingMetaInput =>
    mode === 'FHIR'
        ? { orgnummer: null, legekontorTlf: null }
        : {
              orgnummer: '112233445',
              legekontorTlf: '+47 99887766',
          }
