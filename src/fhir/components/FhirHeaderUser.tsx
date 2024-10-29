'use client'

import React, { ReactElement } from 'react'
import { createPortal } from 'react-dom'
import { Alert, BodyShort, Detail, Skeleton, Tooltip } from '@navikt/ds-react'
import { useQuery } from '@tanstack/react-query'
import { CheckmarkIcon, XMarkOctagonIcon } from '@navikt/aksel-icons'

import { pathWithBasePath } from '@utils/url'

import { getFhirIdTokenFromSessionStorage } from '../auth/session'
import { useFhirUser } from '../hooks/use-fhir-user'

function FhirHeaderUser(): ReactElement | null {
    const { data, isLoading, error } = useFhirUser()

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
            {isLoading && (
                <div className="flex gap-3 items-center">
                    <div>
                        <Skeleton width={140} />
                        <Skeleton width={80} />
                    </div>
                    <div className="w-8 h-8">
                        <Skeleton variant="circle" height="100%" />
                    </div>
                </div>
            )}
            {error && !isLoading && (
                <Alert variant="error" size="small">
                    Kunne ikke hente brukerinformasjon
                </Alert>
            )}
            {!isLoading && data && (
                <div className="flex gap-3 items-center">
                    <div>
                        <BodyShort>{data.navn}</BodyShort>
                        <Detail>{data.epjDescription}</Detail>
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
            const result = await fetch(pathWithBasePath('/api/verify-token'), {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${getFhirIdTokenFromSessionStorage()}`,
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
