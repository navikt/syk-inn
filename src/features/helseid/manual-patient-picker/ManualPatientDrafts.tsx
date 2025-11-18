import React, { ReactElement } from 'react'
import { Detail, Heading, LinkCard, Skeleton, Tag } from '@navikt/ds-react'
import { useQuery } from '@apollo/client/react'
import Link from 'next/link'

import { DraftFragment, GetAllDraftsDocument } from '@queries'
import { safeParseDraft } from '@data-layer/draft/draft-schema'
import {
    draftAktivitetText,
    draftArbeidsforholdText,
    draftDiagnoseText,
} from '@features/fhir/dashboard/combo-table/draft/draft-utils'
import { AutoUpdatingDistance } from '@features/fhir/dashboard/combo-table/draft/AutoUpdatingDistance'

type Props = {
    ident: string
}

function ManualPatientDrafts({ ident }: Props): ReactElement {
    const draftsQuery = useQuery(GetAllDraftsDocument)

    const hasDrafts = draftsQuery.data?.drafts != null && draftsQuery.data.drafts.length > 0
    const drafts = draftsQuery.data?.drafts ?? []

    return (
        <section className="mt-4" aria-labelledby="utkast-heading">
            <Heading level="3" size="medium" id="utkast-heading" spacing>
                Utkast
            </Heading>
            <div className="flex flex-col gap-3">
                {draftsQuery.loading && <Skeleton width="100%" height={90} variant="rounded" />}
                {!draftsQuery.loading && hasDrafts
                    ? drafts.map((draft) => <ContinueDraftCard key={draft.draftId} draft={draft} ident={ident} />)
                    : null}
                {!draftsQuery.loading && !hasDrafts && <p>Du har ingen pågående utkast for denne pasienten.</p>}
            </div>
        </section>
    )
}

function ContinueDraftCard({ draft, ident }: { draft: DraftFragment; ident: string }): ReactElement {
    const values = safeParseDraft(draft.draftId, draft.values)

    return (
        <LinkCard size="small">
            <LinkCard.Title>
                <LinkCard.Anchor asChild>
                    <Link href={`/draft/${draft.draftId}`}>Fortsett utkast for {ident}</Link>
                </LinkCard.Anchor>
                <LinkCard.Footer className="relative">
                    <Tag size="small" variant="neutral">
                        {draftDiagnoseText(values?.hoveddiagnose)}
                    </Tag>
                    {draftAktivitetText(values?.perioder) != null && (
                        <Tag size="small" variant="neutral">
                            {draftAktivitetText(values?.perioder)}
                        </Tag>
                    )}
                    {draftArbeidsforholdText(values?.arbeidsforhold) != null && (
                        <Tag size="small" variant="neutral">
                            {draftArbeidsforholdText(values?.arbeidsforhold)}
                        </Tag>
                    )}
                    <Detail className="absolute text-xs -right-8 bottom-1 font-normal">
                        Sist endret <AutoUpdatingDistance time={draft.lastUpdated} />
                    </Detail>
                </LinkCard.Footer>
            </LinkCard.Title>
        </LinkCard>
    )
}

export default ManualPatientDrafts
