'use client'

import React, { ReactElement } from 'react'
import { createPortal } from 'react-dom'
import { BodyShort, Detail, Skeleton, Tooltip } from '@navikt/ds-react'
import { useQuery } from '@tanstack/react-query'
import { CheckmarkIcon, XMarkOctagonIcon } from '@navikt/aksel-icons'

import { pathWithBasePath } from '@utils/url'

import { BehandlerInfo } from '../../data-fetcher/data-service'
import { getFhirAccessTokenFromSessionStorage } from '../auth/session'

type Props = {
    isLoading: boolean
    behandler: BehandlerInfo | undefined
}

function FhirHeaderUser({ isLoading, behandler }: Props): ReactElement | null {
    const fhirUserPortalElement = document.getElementById('fhir-user-portal')
    if (!fhirUserPortalElement) {
        return null
    }

    /**
     * This component portals into a slot in the header, because the FhirHeader is
     * rendered outside of the normal data-provider.
     */
    return createPortal(
        <div className="h-full flex flex-col justify-center items-end mr-2">
            {/*// TODO: Loading skellington*/}
            {!isLoading && behandler && (
                <div className="flex gap-3 items-center">
                    <div>
                        <BodyShort>{behandler.navn}</BodyShort>
                        <Detail>{behandler.epjDescription}</Detail>
                    </div>
                    <VerifiedBadge />
                </div>
            )}
        </div>,
        fhirUserPortalElement,
    )
}

function VerifiedBadge(): ReactElement {
    const { data, isLoading, error } = useQuery({
        queryKey: ['fhir-user-token-verification'],
        queryFn: async (): Promise<{ ok: 'ok' } | { message: string }> => {
            const result = await fetch(pathWithBasePath('/fhir/verify-token'), {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${getFhirAccessTokenFromSessionStorage()}`,
                },
            })
            if (!result.ok) {
                throw new Error('Failed to verify token')
            }
            return await result.json()
        },
    })

    if (isLoading) {
        return (
            <div className="w-8 h-8">
                <Skeleton variant="circle" height="100%" />
            </div>
        )
    }

    if (error || (data != null && 'message' in data)) {
        const message = (data && 'message' in data ? data.message : error?.message) ?? 'Kunne ikke verifisere bruker'
        return (
            <Tooltip content={message}>
                <div className="w-8 h-8 bg-surface-danger-subtle rounded-full flex items-center justify-center border-2 border-border-danger">
                    <XMarkOctagonIcon fontSize="22" className="text-text-danger" />
                </div>
            </Tooltip>
        )
    }

    return (
        <Tooltip content="Token verifisiert mot issuer!">
            <div className="w-8 h-8 bg-surface-success-subtle rounded-full flex items-center justify-center border-2 border-border-success">
                <CheckmarkIcon fontSize="22" className="text-surface-success" />
            </div>
        </Tooltip>
    )
}

export default FhirHeaderUser
