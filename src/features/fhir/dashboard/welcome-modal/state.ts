export const WELCOME_MODAL_LOCAL_STORAGE_KEY = 'has-seen-welcome-modal'

export function setModalDismissed(): void {
    localStorage.setItem(WELCOME_MODAL_LOCAL_STORAGE_KEY, 'true')
}

export function hasSeenModal(): boolean {
    return localStorage.getItem(WELCOME_MODAL_LOCAL_STORAGE_KEY) === 'true'
}
