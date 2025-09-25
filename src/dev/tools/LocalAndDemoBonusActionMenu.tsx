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
                            {currentOverride !== null && (
                                <div className="absolute -top-1 -right-2 w-0  text-xs">
                                    <div className="text-nowrap">Valgt overstyring</div>
                                    <div className="font-bold flex">{currentOverride}</div>
                                </div>
                            )}
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
                        Avvist (forventet)
                    </ActionMenu.Item>
                    <ActionMenu.Item
                        onSelect={async () => {
                            await setVerifySendOverride('manual')
                            await mutation.opprettSykmelding()
                        }}
                    >
                        Manuell behandling (forventet)
                    </ActionMenu.Item>
                    <ActionMenu.Item
                        onSelect={async () => {
                            await setVerifySendOverride('invalid-unexpected')
                            await mutation.opprettSykmelding()
                        }}
                    >
                        Avvist med uforventet regelbrudd
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
    )
}
