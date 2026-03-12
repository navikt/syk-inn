import { BodyShort, InfoCard, Link } from '@navikt/ds-react'
import { ReactElement } from 'react'

export function InfoNySykmeldingCard(): ReactElement {
    return (
        <InfoCard data-color="info">
            <InfoCard.Header>
                <InfoCard.Title>Velkommen til ny sykmeldingsløsning</InfoCard.Title>
            </InfoCard.Header>
            <InfoCard.Content>
                <BodyShort spacing>
                    Løsningen er under utvikling, og har derfor litt begrenset funksjonalitet på noen områder. Foreløpig
                    har vi ikke støtte for:
                </BodyShort>
                <BodyShort spacing>
                    <ul className="list-disc pl-6">
                        <li>Enkeltstående behandlingsdager</li>
                        <li>avventende sykmelding</li>
                        <li>reisetilskudd</li>
                    </ul>
                </BodyShort>
                <BodyShort spacing>
                    For sykmeldinger hvor dette er aktuelt, må du inntil videre bruke gammel/eksisterende/ordinær
                    løsning. Les mer om ny sykmeldingsløsning på{' '}
                    <Link href="https://www.nav.no/ny-sykmeldingslosning" target="_blank" rel="noopener noreferrer">
                        nav.no
                    </Link>
                </BodyShort>
            </InfoCard.Content>
        </InfoCard>
    )
}
