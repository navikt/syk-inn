import { useQuery } from '@apollo/client/react'
import { ChevronDownIcon, FirstAidIcon, TrainIcon } from '@navikt/aksel-icons'
import { ActionMenu, BodyShort, Checkbox, Detail, Heading, Skeleton } from '@navikt/ds-react'
import React, { ReactElement, useState } from 'react'

import { SimpleAlert } from '#components/help/GeneralErrors'
import { AssableNextLink } from '#components/links/AssableNextLink'
import { ShortcutButton, ShortcutButtonLink } from '#components/shortcut/ShortcutButtons'
import { useMode } from '#core/providers/Modes'
import { FORM_VARIANT_KEY, NySykmeldingFormVariantType } from '#features/ny-sykmelding-form/useFormVariant'
import { PasientDocument } from '#queries'

export function StartSykmelding({ className }: { className?: string }): ReactElement {
    const { data, loading, error, refetch } = useQuery(PasientDocument)
    const [hasLegged, setHasLegged] = useState(true)

    return (
        <div className={className}>
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
                        <Detail className="font-ax-bold">Navn</Detail>
                        <BodyShort spacing>{data.pasient.navn ?? 'Navn mangler'}</BodyShort>
                    </div>
                    <div>
                        <Detail className="font-ax-bold">ID-nummer</Detail>
                        <BodyShort spacing>{data.pasient.ident}</BodyShort>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-3">
                <div className="grow pt-4">
                    <Checkbox checked={hasLegged} onChange={() => setHasLegged((x) => !x)} size="small">
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
                        >
                            Behandlingsdager
                        </ActionMenu.Item>
                        <ActionMenu.Item
                            icon={<TrainIcon aria-hidden />}
                            as={AssableNextLink}
                            href={`${mode.paths.ny}?${FORM_VARIANT_KEY}=${'REISETILSKUDD' satisfies NySykmeldingFormVariantType}`}
                            onSelect={() => setLinkPending(true)}
                        >
                            Reisetilskudd
                        </ActionMenu.Item>
                    </ActionMenu.Group>
                </ActionMenu.Content>
            </ActionMenu>
        </div>
    )
}
