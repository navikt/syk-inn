export function GET(request: Request): Response {
    const bearer = request.headers.get('Authorization')

    return new Response(bearer?.replace('Bearer ', '') ?? 'nothing to see here')
}
