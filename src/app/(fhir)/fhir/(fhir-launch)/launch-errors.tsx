import { PropsWithChildren, ReactElement } from 'react'
import { BodyShort, Heading } from '@navikt/ds-react'
import { PageBlock } from '@navikt/ds-react/Page'

export function MissingLaunchParams(): ReactElement {
    return (
        <LaunchError>
            <Heading size="large" spacing>
                Ugyldig start av applikasjon
            </Heading>
            <BodyShort spacing>
                Det ser ut til at du har startet applikasjonen på en ugyldig måte. Vennligst prøv igjen.
            </BodyShort>
            <BodyShort>Dersom problemet vedvarer, ta kontakt med support.</BodyShort>
        </LaunchError>
    )
}

export function InvalidIssuer(): ReactElement {
    return (
        <LaunchError>
            <Heading size="large" spacing>
                Ugyldig utsteder
            </Heading>
            <BodyShort spacing>
                Det ser ut til at du har startet applikasjonen med en ugyldig utsteder. Vennligst prøv igjen.
            </BodyShort>
            <BodyShort>Dersom problemet vedvarer, ta kontakt med support.</BodyShort>
        </LaunchError>
    )
}

export function InvalidCode(): ReactElement {
    return (
        <LaunchError>
            <Heading size="large" spacing>
                Ugyldig autorisasjonskode
            </Heading>
            <BodyShort spacing>
                Det ser ut til at du har startet applikasjonen med en ugyldig autorisasjonskode. Vennligst prøv igjen.
            </BodyShort>
            <BodyShort>Dersom problemet vedvarer, ta kontakt med support.</BodyShort>
        </LaunchError>
    )
}

export function UnknownError(): ReactElement {
    return (
        <LaunchError>
            <Heading size="large" spacing>
                En uventet oppstartsfeil har oppstått
            </Heading>
            <BodyShort spacing>
                Det ser ut til at det har oppstått en uventet feil under oppstart av applikasjonen. Vennligst prøv
                igjen.
            </BodyShort>
            <BodyShort>Dersom problemet vedvarer, ta kontakt med support.</BodyShort>
        </LaunchError>
    )
}

export function CallbackError(): ReactElement {
    return (
        <LaunchError>
            <Heading size="large" spacing>
                Det skjedde en feil under innloggingen
            </Heading>
            <BodyShort spacing>
                Prøv å lukk pasienten og åpne denne applikasjonen på nytt. Hvis det ikke hjelper, prøv å logge ut og inn
                igjen.
            </BodyShort>
            <BodyShort>Dersom problemet vedvarer, ta kontakt med support.</BodyShort>
        </LaunchError>
    )
}

function LaunchError({ children }: PropsWithChildren): ReactElement {
    return (
        <PageBlock as="main" width="xl" gutters className="pt-4">
            <div className="max-w-prose">{children}</div>
        </PageBlock>
    )
}
