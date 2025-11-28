import React, { ReactElement } from 'react'
import { useQueryState } from 'nuqs'
import { ActionMenu, Button } from '@navikt/ds-react'
import { MenuElipsisVerticalIcon, TerminalIcon } from '@navikt/aksel-icons'

import { MockRuleMarkers } from '@dev/mock-engine/SykInnApiMockRuleMarkers'
import { cn } from '@lib/tw'
import { UseOpprettSykmeldingMutation } from '@features/ny-sykmelding-form/useOpprettSykmeldingMutation'

export function LocalAndDemoBonusActionMenu({
    mutation,
}: {
    mutation: UseOpprettSykmeldingMutation['mutation']
}): ReactElement {
    const [currentOverride, setVerifySendOverride] = useQueryState(MockRuleMarkers.query)

    return (
        <div className={cn('flex items-center', { 'text-red-500': currentOverride != null })}>
            <ActionMenu>
                <ActionMenu.Trigger>
                    <Button
                        variant="tertiary-neutral"
                        loading={mutation.result.loading}
                        icon={
                            <figure
                                title="Flere demo-handlinger"
                                className={cn('relative', { 'text-red-500': currentOverride != null })}
                            >
                                <TerminalIcon aria-hidden />
                                <div className="bg-bg-subtle h-2 w-2  absolute top-0 right-1.25" />
                                <MenuElipsisVerticalIcon
                                    aria-hidden
                                    className="absolute -top-[6px] -right-[3px] animate-bounce"
                                />
                            </figure>
                        }
                        iconPosition="right"
                    />
                </ActionMenu.Trigger>
                <ActionMenu.Content>
                    <ActionMenu.Group label="Send sykmelding som blir...">
                        <ActionMenu.Item
                            onSelect={async () => {
                                await setVerifySendOverride('invalid')
                                await mutation.opprettSykmelding()
                            }}
                        >
                            Soft stop (send læll)
                        </ActionMenu.Item>
                        <ActionMenu.Item
                            onSelect={async () => {
                                await setVerifySendOverride('manual')
                                await mutation.opprettSykmelding()
                            }}
                        >
                            Soft stop - manuell behandling (send læll)
                        </ActionMenu.Item>
                        <ActionMenu.Item
                            onSelect={async () => {
                                await setVerifySendOverride('invalid-unexpected')
                                await mutation.opprettSykmelding()
                            }}
                        >
                            Hard stop - Regelutfall
                        </ActionMenu.Item>
                        <ActionMenu.Item
                            onSelect={async () => {
                                await setVerifySendOverride('person-not-found')
                                await mutation.opprettSykmelding()
                            }}
                        >
                            Hard stop - Pasient finnes ikke
                        </ActionMenu.Item>
                    </ActionMenu.Group>
                    <ActionMenu.Group label="Fjern regeloverstyring">
                        <ActionMenu.Item
                            onSelect={async () => {
                                await setVerifySendOverride(null)
                                await mutation.opprettSykmelding()
                            }}
                        >
                            Send uten overstyring
                        </ActionMenu.Item>
                    </ActionMenu.Group>
                </ActionMenu.Content>
            </ActionMenu>
            {currentOverride !== null && (
                <div className="text-xs pointer-events-none">
                    <div className="text-nowrap">Valgt overstyring</div>
                    <div className="text-nowrap font-bold flex">{currentOverride}</div>
                </div>
            )}
        </div>
    )
}
