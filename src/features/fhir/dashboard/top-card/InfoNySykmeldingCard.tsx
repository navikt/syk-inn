import { BodyShort, InfoCard, Link } from '@navikt/ds-react'
import { ReactElement } from 'react'

export function InfoNySykmeldingCard({ className }: { className?: string }): ReactElement {
    return (
        <div className={className}>
            <InfoCard data-color="info">
                <InfoCard.Header>
                    <InfoCard.Title>Velkommen til ny sykmeldingsløsning</InfoCard.Title>
                </InfoCard.Header>
                <InfoCard.Content className="max-w-prose">
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
                </InfoCard.Content>
            </InfoCard>
        </div>
    )
}
