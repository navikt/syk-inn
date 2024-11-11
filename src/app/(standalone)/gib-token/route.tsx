export function GET(request: Request): Response {
    const bearer = request.headers.get('Authorization')

    return Response.json({
        token: bearer?.replace('Bearer ', '') ?? 'nothing to see here',
        ps: "don't tell anyone",
    })
}
