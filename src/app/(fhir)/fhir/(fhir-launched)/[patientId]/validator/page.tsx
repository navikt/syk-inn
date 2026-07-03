import { Alert, Heading, Loader, Skeleton, Tag } from '@navikt/ds-react'
import { Validation, ValidationOutcome } from '@navikt/smart-on-fhir/client'
import React, { PropsWithChildren, ReactElement, Suspense } from 'react'

import { PageLayout } from '#components/layout/Page'
import { AkselNextLink } from '#components/links/AkselNextLink'
import { createFhirPaths } from '#core/providers/ModePaths'
import { getReadyClient } from '#data-layer/fhir/smart/ready-client'

import { Filter } from './filter'
import { LoadingQuips } from './validator'

function Page({ params, searchParams }: PageProps<'/fhir/[patientId]/validator'>): ReactElement {
    const patientIdPromise = params.then((it) => it.patientId)
    const fullReport = searchParams.then((it) => it.full as string | undefined)

    return (
        <PageLayout noHeading size="fit" bg="white">
            <Suspense fallback={<ValidatorLoading />}>
                <ExecuteValidation patientId={patientIdPromise} fullReport={fullReport} />
            </Suspense>
        </PageLayout>
    )
}

function ValidatorContainer({ children }: PropsWithChildren): ReactElement {
    return <div className="flex flex-col max-w-prose w-screen p-4">{children}</div>
}

function ValidatorLoading(): ReactElement {
    return (
        <ValidatorContainer>
            <Heading level="2" size="large">
                Kjører validering
                <Loader className="ml-2" size="medium" />
            </Heading>
            <div>
                <LoadingQuips />
                <Skeleton height={48} width="50%" />
                <Skeleton height={180} width="100%" variant="rounded" className="mb-4" />
                <Skeleton height={48} width="50%" />
                <Skeleton height={180} width="100%" variant="rounded" className="mb-4" />
                <Skeleton height={48} width="50%" />
                <Skeleton height={180} width="100%" variant="rounded" className="mb-4" />
            </div>
        </ValidatorContainer>
    )
}

async function ExecuteValidation({
    patientId,
    fullReport,
}: {
    patientId: Promise<string>
    fullReport: Promise<string | undefined>
}): Promise<ReactElement> {
    const client = await getReadyClient(await patientId)

    if ('error' in client) {
        return <div>Failed to run validation, cause: {client.error}</div>
    }

    await client.patient.request()
    await client.user.request()
    const encounter = await client.encounter.request()
    if (!('error' in encounter)) {
        await client.request(encounter.serviceProvider.reference as `Organization/${string}`)
    }

    const showEverything = (await fullReport) === 'true'
    const report = client.getValidationReport()
    return (
        <ValidatorContainer>
            <AkselNextLink href={createFhirPaths(await patientId).root} className="text-xs">
                ← Tilbake til dashboard
            </AkselNextLink>
            <div className="flex items-start justify-between">
                <Heading level="2" size="large" spacing>
                    Valideringsrapport
                </Heading>
                <Filter />
            </div>
            <div className="flex flex-col gap-4">
                {report.map((validation) => (
                    <ValidationSection key={validation.type} validation={validation} onlyWarnAndUp={!showEverything} />
                ))}
            </div>
        </ValidatorContainer>
    )
}

function ValidationSection({
    validation,
    onlyWarnAndUp,
}: {
    validation: Validation
    onlyWarnAndUp: boolean
}): ReactElement {
    const headingId = `validator-report-${validation.type}`

    return (
        <section aria-labelledby={headingId} className="flex flex-col gap-2">
            <Heading size="small" level="3" id={headingId} className="flex items-center gap-2">
                {validation.type}
                <OverallStatus status={validation.status} />
            </Heading>
            {validation.status === 'UNVALIDATED' ? (
                <Alert variant="info" size="small" inline>
                    Testen er ikke kjørt. Det kan være fordi ressursen feilet, eller at den ikke har blitt forsøkt
                    hentet.
                </Alert>
            ) : (
                <ValidationTestsList tests={validation.tests} onlyWarnAndUp={onlyWarnAndUp} />
            )}
        </section>
    )
}

function ValidationTestsList({
    tests,
    onlyWarnAndUp,
}: {
    tests: ValidationOutcome['tests']
    onlyWarnAndUp: boolean
}): ReactElement {
    const filteredTests = onlyWarnAndUp ? tests.filter((t) => t.type !== 'OK') : tests

    if (filteredTests.length === 0) {
        return (
            <Alert variant="success" size="small" inline>
                Alt er i orden, ingen varsler eller feil
            </Alert>
        )
    }

    return (
        <>
            {filteredTests.map((test) => (
                <Alert key={test.message} variant={TEST_VARIANT[test.type]} size="small" inline>
                    {test.message}
                </Alert>
            ))}
        </>
    )
}

const TEST_VARIANT = {
    OK: 'success',
    WARNING: 'warning',
    ERROR: 'error',
} as const

function OverallStatus({ status }: { status: Validation['status'] }): ReactElement {
    switch (status) {
        case 'OK':
            return (
                <Tag variant="success" size="small">
                    Godkjent
                </Tag>
            )
        case 'WARNING':
            return (
                <Tag variant="warning" size="small">
                    Hint
                </Tag>
            )
        case 'ERROR':
            return (
                <Tag variant="error" size="small">
                    Feil
                </Tag>
            )
        case 'UNVALIDATED':
            return (
                <Tag variant="neutral" size="small">
                    Ikke testet
                </Tag>
            )
    }
}

export default Page
