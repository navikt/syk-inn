import { isLocal } from '@lib/env'

const CONVERT_PATH = '/forms/chromium/convert/html'

export function getConvertUrl(): string {
    if (isLocal) {
        return 'http://localhost:6900' + CONVERT_PATH
    } else {
        // Demo will also use dev gotenberg
        return `http://tsm-gotenberg` + CONVERT_PATH
    }
}

export const Gotenberg = {
    BODY: 'index.html',
    HEADER: 'header.html',
    FOOTER: 'footer.html',
}
