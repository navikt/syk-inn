import { getHelseIdUserInfo } from '../../../helseid/user'

export async function GET(): Promise<Response> {
    const userInfo = await getHelseIdUserInfo()

    return Response.json(userInfo)
}
