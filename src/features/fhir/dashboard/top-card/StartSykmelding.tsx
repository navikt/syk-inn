import React, { ReactElement, useState } from 'react'
import { ActionMenu, BodyShort, Checkbox, Detail, Heading, Skeleton } from '@navikt/ds-react'
import { useQuery } from '@apollo/client/react'
import { CarIcon, ChevronDownIcon, FirstAidIcon, GavelSoundBlockIcon } from '@navikt/aksel-icons'
import { logger } from '@navikt/next-logger'

import { ShortcutButton, ShortcutButtonLink } from '@components/shortcut/ShortcutButtons'
import { PasientDocument } from '@queries'
import { SimpleAlert } from '@components/help/GeneralErrors'
import { useMode } from '@core/providers/Modes'

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
                <FancyMultiOptionStartButton
                    disabled={loading || !hasLegged || data?.pasient == null}
                    loading={loading}
                />
            </div>
        </div>
    )
}

export function FancyMultiOptionStartButton({
    loading,
    disabled,
}: {
    loading: boolean
    disabled: boolean
}): ReactElement {
    const mode = useMode()

    return (
        <div className="flex gap-[2px]">
            <ShortcutButtonLink
                href={mode.paths.ny}
                variant="primary"
                disabled={disabled}
                loading={loading}
                size="medium"
                buttonClassName="rounded-r-none"
                shortcut={{
                    modifier: 'alt',
                    code: 'KeyN',
                    hintPlacement: 'bottom-start',
                }}
            >
                Opprett sykmelding
            </ShortcutButtonLink>
            <ActionMenu>
                <ActionMenu.Trigger>
                    <ShortcutButton
                        shortcut={{ modifier: 'alt', code: 'KeyM', hintPlacement: 'bottom' }}
                        variant="primary"
                        buttonClassName="rounded-l-none"
                        icon={<ChevronDownIcon title="Andre handlinger" />}
                    />
                </ActionMenu.Trigger>
                <ActionMenu.Content>
                    <ActionMenu.Group label="Andre sykmeldingstyper">
                        <ActionMenu.Item
                            icon={<FirstAidIcon aria-hidden />}
                            onSelect={() => {
                                logger.info('First item!')
                            }}
                        >
                            Behandlingsdager
                        </ActionMenu.Item>
                        <ActionMenu.Item
                            icon={<CarIcon aria-hidden />}
                            onSelect={() => {
                                logger.info('Second item!')
                            }}
                        >
                            Reisetilskudd
                        </ActionMenu.Item>
                    </ActionMenu.Group>
                    <ActionMenu.Group label="Andre andre andre ting">
                        <ActionMenu.Item
                            icon={<GavelSoundBlockIcon aria-hidden />}
                            onSelect={() => {
                                logger.info('Third item!')
                            }}
                        >
                            Annen lovfestet fraværsgrunn
                        </ActionMenu.Item>
                    </ActionMenu.Group>
                </ActionMenu.Content>
            </ActionMenu>
        </div>
    )
}

export default StartSykmelding
