import { base64url } from 'jose'
import { redirect as nextRedirect, RedirectType } from 'next/navigation'
import * as security from 'fhirclient/lib/security/server'
import { ready, authorize, init } from 'fhirclient/lib/smart'
import { fhirclient } from 'fhirclient/lib/types'
import Client from 'fhirclient/lib/Client'

interface NextAdapterOptions {
    headers: Headers
    storage: fhirclient.Storage | fhirclient.storageFactory
}

/**
 * Next.js Adapter - works with app directory server router
 */
export default class NextAdapter implements fhirclient.Adapter {
    /**
     * Holds the Storage instance associated with this instance
     */
    protected _storage: fhirclient.Storage | null = null

    options: NextAdapterOptions
    security = security

    constructor(options: NextAdapterOptions) {
        this.options = { ...options }
    }

    /**
     * Given a relative path, returns an absolute url using the instance base URL
     */
    relative(path: string): string {
        return new URL(path, this.getUrl().href).href
    }

    /**
     * Returns the protocol of the current request ("http" or "https")
     */
    getProtocol(): string {
        return this.options.headers.get('x-forwarded-proto') as string
    }

    /**
     * Given the current environment, this method must return the current url
     * as URL instance. In Node we might be behind a proxy!
     */
    getUrl(): URL {
        const headers = this.options.headers

        let host = this.options.headers.get('host')
        if (headers.get('x-forwarded-host')) {
            host = headers.get('x-forwarded-host') as string
            if (headers.get('x-forwarded-port') && host.indexOf(':') === -1) {
                host += ':' + headers.get('x-forwarded-port')
            }
        }

        const protocol = this.getProtocol()
        const orig = String(headers.get('x-original-uri'))

        return new URL(orig, protocol + '://' + host)
    }

    /**
     * Given the current environment, this method must redirect to the given
     * path
     * @param location The path to redirect to
     */
    redirect(location: string): void {
        nextRedirect(location, RedirectType.replace)
    }

    /**
     * Returns a ServerStorage instance
     */
    getStorage(): fhirclient.Storage {
        if (!this._storage) {
            if (this.options.storage) {
                if (typeof this.options.storage == 'function') {
                    this._storage = this.options.storage(this.options)
                } else {
                    this._storage = this.options.storage
                }
            } else {
                throw new Error(
                    'NextAdapter does not support automatic server storage, please provide a storage instance.',
                )
            }
        }
        return this._storage
    }

    /**
     * Base64 to ASCII string
     */
    btoa(str: string): string {
        // The "global." makes Webpack understand that it doesn't have to
        // include the Buffer code in the bundle
        return global.Buffer.from(str).toString('base64')
    }

    /**
     * ASCII string to Base64
     */
    atob(str: string): string {
        // The "global." makes Webpack understand that it doesn't have to
        // include the Buffer code in the bundle
        return global.Buffer.from(str, 'base64').toString('ascii')
    }

    base64urlencode(input: string | Uint8Array): string {
        return base64url.encode(input)
    }

    base64urldecode(input: string): string {
        return base64url.decode(input).toString()
    }

    /**
     * Returns a reference to the AbortController constructor. In browsers,
     * AbortController will always be available as global (native or polyfilled)
     */
    getAbortController(): typeof AbortController {
        return AbortController
    }

    /**
     * Creates and returns adapter-aware SMART api. Not that while the shape of
     * the returned object is well known, the arguments to this function are not.
     * Those who override this method are free to require any environment-specific
     * arguments. For example in node we will need a request, a response and
     * optionally a storage or storage factory function.
     */
    getSmartApi(): fhirclient.SMART {
        return {
            ready: (...args) => ready(this, ...args),
            authorize: (options) => authorize(this, options),
            init: (options) => init(this, options),
            client: (state: string | fhirclient.ClientState) => new Client(this, state),
            options: this.options,
        }
    }
}
