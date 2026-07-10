import { useQuery } from '@apollo/client/react'
import { ChevronRightIcon } from '@navikt/aksel-icons'
import { BodyShort, Detail, Heading, Skeleton } from '@navikt/ds-react'
import { parseAsBoolean, useQueryState } from 'nuqs'
import React, { ReactElement } from 'react'

import { SimpleAlert } from '#components/help/GeneralErrors'
import { ShortcutButtonLink } from '#components/shortcut/ShortcutButtons'
import { useMode } from '#core/providers/Modes'
import { FORM_VARIANT_KEY, NySykmeldingFormVariantType } from '#features/ny-sykmelding-form/useFormVariant'
import { PasientDocument } from '#queries'

export function StartSykmelding({ className }: { className?: string }): ReactElement {
    const { data, loading, error, refetch } = useQuery(PasientDocument)
    const [isKnown] = useQueryState('known', parseAsBoolean.withDefault(true))

    return (
        <div className={className}>
            {loading ? (
                <Skeleton width={240} height={42} variant="text" className="mb-3" />
            ) : (
                <Heading level="3" size="large" spacing>
                    {data?.pasient?.navn ?? 'Navn mangler'}
                </Heading>
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
            <div className="flex flex-col md:flex-row justify-between">
                <div>
                    {loading && (
                        <div>
                            <Skeleton width={120} height={22} />
                            <Skeleton width={120} />
                        </div>
                    )}
                    {!loading && data?.pasient && (
                        <div>
                            <Detail className="font-ax-bold">ID-nummer</Detail>
                            <BodyShort>{data.pasient.ident}</BodyShort>
                        </div>
                    )}
                </div>
                <div className="flex mt-4 md:mt-0 flex-wrap gap-2 justify-end">
                    <StartSykmeldingActions disabled={loading || !isKnown || data?.pasient == null} loading={loading} />
                </div>
            </div>
        </div>
    )
}

export function StartSykmeldingActions({ loading, disabled }: { loading: boolean; disabled: boolean }): ReactElement {
    const mode = useMode()

    return (
        <>
            <ShortcutButtonLink
                href={mode.paths.ny}
                variant="primary"
                disabled={disabled}
                loading={loading}
                iconPosition="right"
                icon={<ChevronRightIcon aria-hidden />}
                className="shrink-0 grow md:grow-0"
                buttonClassName="w-full"
                shortcut={{
                    modifier: 'alt',
                    code: 'KeyN',
                    hintPlacement: 'bottom-start',
                }}
            >
                Opprett ny sykmelding
            </ShortcutButtonLink>
            <ShortcutButtonLink
                href={`${mode.paths.ny}?${FORM_VARIANT_KEY}=${'REISETILSKUDD' satisfies NySykmeldingFormVariantType}`}
                variant="secondary"
                disabled={disabled}
                loading={loading}
                iconPosition="right"
                icon={<ChevronRightIcon aria-hidden />}
                className="shrink-0 grow md:grow-0"
                buttonClassName="w-full"
                shortcut={{
                    modifier: 'alt',
                    code: 'KeyM',
                    hintPlacement: 'bottom-start',
                }}
            >
                Opprett sykmelding med reisetilskudd
            </ShortcutButtonLink>
            <ShortcutButtonLink
                href={`${mode.paths.ny}?${FORM_VARIANT_KEY}=${'BEHANDLINGSDAGER' satisfies NySykmeldingFormVariantType}`}
                variant="secondary"
                disabled={disabled}
                loading={loading}
                iconPosition="right"
                icon={<ChevronRightIcon aria-hidden />}
                className="shrink-0 grow md:grow-0"
                buttonClassName="w-full"
                shortcut={{
                    modifier: 'alt',
                    code: 'KeyB',
                    hintPlacement: 'bottom-start',
                }}
            >
                Opprett sykmelding med behandlingsdager
            </ShortcutButtonLink>
        </>
    )
}
