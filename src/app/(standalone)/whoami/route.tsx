import { getHelseIdUserInfo } from '../../../helseid/helseid-userinfo'

export async function GET(): Promise<Response> {
    const userInfo = await getHelseIdUserInfo()

    return Response.json(userInfo)
}
