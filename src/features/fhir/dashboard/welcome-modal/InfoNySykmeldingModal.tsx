import { BodyShort, Button, Dialog, Link } from '@navikt/ds-react'
import { ReactElement, useEffect } from 'react'
import { InformationSquareIcon } from '@navikt/aksel-icons'

import { useAppDispatch, useAppSelector } from '@core/redux/hooks'
import { metadataActions } from '@core/redux/reducers/metadata'
import { hasSeenModal, setModalDismissed } from '@features/fhir/dashboard/welcome-modal/state'

/**
 * This modal is always client-side only and is responsible for hydrating the local storage
 * to redux. We will assume the user has seen it to optimise for returning users.
 */
export function InfoNySykmeldingModal(): ReactElement {
    const open = useAppSelector((state) => !state.metadata.dismissedWelcome)
    const dispatch = useAppDispatch()

    const dismiss = (): void => {
        setModalDismissed()
        dispatch(metadataActions.dismissWelcome())
    }

    useEffect(() => {
        const hasSeen = hasSeenModal()
        if (!hasSeen) {
            dispatch(metadataActions.openWelcome())
        }
    }, [dispatch])

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) dismiss()
            }}
        >
            <Dialog.Popup>
                <Dialog.Header>
                    <Dialog.Title className="flex flex-row items-center gap-2">
                        <InformationSquareIcon aria-hidden />
                        Velkommen til ny sykmeldingsløsning
                    </Dialog.Title>
                </Dialog.Header>
                <Dialog.Body>
                    <BodyShort spacing>
                        Løsningen er under utvikling, og har derfor litt begrenset funksjonalitet på noen områder.
                        Foreløpig har vi ikke støtte for:
                    </BodyShort>
                    <ul className="list-disc pl-6 mb-3">
                        <li>Enkeltstående behandlingsdager</li>
                        <li>avventende sykmelding</li>
                        <li>reisetilskudd</li>
                    </ul>
                    <BodyShort spacing>
                        For sykmeldinger hvor dette er aktuelt, må du inntil videre bruke gammel/eksisterende/ordinær
                        løsning.
                    </BodyShort>
                    <Link
                        href="https://www.nav.no/samarbeidspartner/ny-sykmelding-informasjonsside"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline"
                    >
                        Les mer om ny sykmeldingsløsning på nav.no (åpnes i ny fane)
                    </Link>
                </Dialog.Body>
                <Dialog.Footer>
                    <Button size="small" onClick={() => dismiss()}>
                        Den er grei
                    </Button>
                </Dialog.Footer>
            </Dialog.Popup>
        </Dialog>
    )
}
