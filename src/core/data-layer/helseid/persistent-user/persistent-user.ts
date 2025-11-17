import { PERSISTENT_USER_SESSION_STORAGE_KEY } from './persistent-user-const'

export function setPersistentUser(user: { ident: string; navn: string }): void {
    sessionStorage.setItem(PERSISTENT_USER_SESSION_STORAGE_KEY, JSON.stringify(user))
}

export function getPersistentUser(): { ident: string; navn: string } | null {
    const userString = sessionStorage.getItem(PERSISTENT_USER_SESSION_STORAGE_KEY)
    return userString ? JSON.parse(userString) : null
}
