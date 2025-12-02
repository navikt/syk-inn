import React, { ReactElement, useState } from 'react'
import { BodyShort, Checkbox, Detail, Heading, Skeleton } from '@navikt/ds-react'
import { useQuery } from '@apollo/client/react'

import { ShortcutButtonLink } from '@components/shortcut/ShortcutButtons'
import { PasientDocument } from '@queries'
import { SimpleAlert } from '@components/help/GeneralErrors'

function StartSykmelding(): ReactElement {
    const { data, loading, error, refetch } = useQuery(PasientDocument)
    const [hasLegged, setHasLegged] = useState(true)

    return (
        <div className="pr-4 lg:pr-16">
            <Heading size="small" level="3">
                Pasientopplysninger
            </Heading>
            <Detail>Denne sykmeldingen opprettes for følgende person</Detail>
            {loading && (
                <div className="flex gap-6 mt-3 mb-2">
                    <div className="min-w-32">
                        <Skeleton width={120} />
                        <Skeleton width={120} />
                    </div>
                    <div>
                        <Skeleton width={120} />
                        <Skeleton width={120} />
                    </div>
                </div>
            )}
            {error && (
                <SimpleAlert
                    level="error"
                    className="max-w-sm mt-2 -mr-20"
                    size="small"
                    title="Kunne ikke hente pasient"
                    retry={() => refetch()}
                    noCallToAction
                >
                    Et midlertidig problem oppstod når vi hentet informasjon om pasienten.
                </SimpleAlert>
            )}
            {!loading && data?.pasient && (
                <div className="flex gap-6 mt-3">
                    <div className="min-w-32">
                        <Detail className="font-bold">Navn</Detail>
                        <BodyShort spacing>{data.pasient.navn ?? 'Navn mangler'}</BodyShort>
                    </div>
                    <div>
                        <Detail className="font-bold">ID-nummer</Detail>
                        <BodyShort spacing>{data.pasient.ident}</BodyShort>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-3">
                <div className="grow">
                    <Checkbox
                        checked={hasLegged}
                        onChange={() => setHasLegged((x) => !x)}
                        size="small"
                        className="p-4 pl-0"
                    >
                        Pasienten er kjent eller har vist legitimasjon
                    </Checkbox>
                </div>

                <ShortcutButtonLink
                    href="/fhir/ny"
                    variant="primary"
                    disabled={loading || !hasLegged || data?.pasient == null}
                    loading={loading}
                    size="medium"
                    shortcut={{
                        modifier: 'alt',
                        code: 'KeyN',
                    }}
                >
                    Opprett sykmelding
                </ShortcutButtonLink>
            </div>
        </div>
    )
}

export default StartSykmelding
