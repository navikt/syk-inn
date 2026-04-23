const LOCAL_STORAGE_KEY = 'has-seen-welcome-modal'

export function setModalDismissed(): void {
    localStorage.setItem(LOCAL_STORAGE_KEY, 'true')
}

export function hasSeenModal(): boolean {
    return localStorage.getItem(LOCAL_STORAGE_KEY) === 'true'
}
