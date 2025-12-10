import metrics from '@lib/prometheus/metrics'

export const POST = (request: Request): Promise<Response> => {
    const url = new URL(request.url)
    const hpr = url.searchParams.get('hpr')

    if (hpr == null) {
        return Promise.resolve(new Response('Missing hpr parameter', { status: 400 }))
    }

    metrics.createdSykmelding.inc(
        {
            hpr: hpr,
            outcome: 'OK',
        },
        1,
    )

    return Promise.resolve(new Response(null, { status: 204 }))
}
