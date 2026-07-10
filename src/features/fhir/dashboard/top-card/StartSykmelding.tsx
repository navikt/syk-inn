import { useQuery } from '@apollo/client/react'
import { ChevronDownIcon, FirstAidIcon, TrainIcon } from '@navikt/aksel-icons'
import { ActionMenu, BodyShort, Detail, Heading, Skeleton } from '@navikt/ds-react'
import { parseAsBoolean, useQueryState } from 'nuqs'
import React, { ReactElement, useState } from 'react'

import { SimpleAlert } from '#components/help/GeneralErrors'
import { AssableNextLink } from '#components/links/AssableNextLink'
import { ShortcutButton, ShortcutButtonLink } from '#components/shortcut/ShortcutButtons'
import { useMode } from '#core/providers/Modes'
import { FORM_VARIANT_KEY, NySykmeldingFormVariantType } from '#features/ny-sykmelding-form/useFormVariant'
import { PasientDocument } from '#queries'

export function StartSykmelding({ className }: { className?: string }): ReactElement {
    const { data, loading, error, refetch } = useQuery(PasientDocument)
    const [isKnown] = useQueryState('known', parseAsBoolean.withDefault(true))

    return (
        <div className={className}>
            {loading && (
                <div>
                    <Skeleton width={240} height={42} variant="text" className="mb-3" />
                    <div>
                        <Skeleton width={120} height={22} />
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
                <div>
                    <Heading level="3" size="large" spacing>
                        {data.pasient.navn ?? 'Navn mangler'}
                    </Heading>
                    <div>
                        <Detail className="font-ax-bold">ID-nummer</Detail>
                        <BodyShort>{data.pasient.ident}</BodyShort>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-3 mt-2">
                <FancyMultiOptionStartButton
                    disabled={loading || !isKnown || data?.pasient == null}
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
    const [isLinkPending, setLinkPending] = useState(false)

    return (
        <div className="flex gap-0.5">
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
                        loading={isLinkPending}
                    />
                </ActionMenu.Trigger>
                <ActionMenu.Content>
                    <ActionMenu.Group label="Andre sykmeldingstyper">
                        <ActionMenu.Item
                            icon={<FirstAidIcon aria-hidden />}
                            as={AssableNextLink}
                            href={`${mode.paths.ny}?${FORM_VARIANT_KEY}=${'BEHANDLINGSDAGER' satisfies NySykmeldingFormVariantType}`}
                            onSelect={() => setLinkPending(true)}
                            disabled={disabled}
                        >
                            Behandlingsdager
                        </ActionMenu.Item>
                        <ActionMenu.Item
                            icon={<TrainIcon aria-hidden />}
                            as={AssableNextLink}
                            href={`${mode.paths.ny}?${FORM_VARIANT_KEY}=${'REISETILSKUDD' satisfies NySykmeldingFormVariantType}`}
                            onSelect={() => setLinkPending(true)}
                            disabled={disabled}
                        >
                            Reisetilskudd
                        </ActionMenu.Item>
                    </ActionMenu.Group>
                </ActionMenu.Content>
            </ActionMenu>
        </div>
    )
}
