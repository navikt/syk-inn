export async function createDocumentReference(): Promise<Response> {
    return mockedDocumentReference()
}

function mockedDocumentReference(): Response {
    return Response.json(
        {
            resourceType: 'DocumentReference',
            id: 'aa66036d-b63c-4c5a-b3d5-b1d1f80000d',
            meta: {
                versionId: '1',
                lastUpdated: '2025-03-04T03:21:36.880-05:00',
            },
        },
        { status: 200 },
    )
}
