export function GET(req: Request): Response {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '')
    const parts = token?.split('.')

    return Response.json({
        token: token,
        header: JSON.parse(atob(parts?.[0] || '')),
        payload: JSON.parse(atob(parts?.[1] || '')),
        signature: parts?.[2],
    })
}
