/* eslint-disable @next/next/no-head-element */

import React, { ReactElement } from 'react'

import { headerFooterStyles } from '@data-layer/pdf/html/styles/header-footer.css'

import { toHTML } from './render'

export async function createHeaderHtml(): Promise<string> {
    return toHTML(
        <html>
            <body>
                <div className="header">
                    <NavLogo />
                    <h1>Innsendt sykmelding</h1>
                </div>
            </body>
        </html>,
    )
}

function NavLogo(): ReactElement {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 58" version="1.2">
            <path
                d="M189.9.9s2.1 0 1.4 1.8l-21.4 53c-.8 1.9-2.7 1.9-2.7 1.9h-20.3s-1.8 0-2.6-1.9L125 7.8v29.3h6.1s1.8 0 1.5 1.4c0 .1-6.9 17.2-6.9 17.2-.8 1.9-2.7 1.9-2.7 1.9h-17.2c-.8 0-1.5-.6-1.5-1.5V39.6l-6.5 16.1c-.8 1.9-2.7 1.9-2.7 1.9h-2.2c-10.2 0-18.3-4.1-23.3-11.1l-3.7 9.2c-.7 1.9-2.6 1.9-2.6 1.9H46.5c-.8 0-1.5-.6-1.5-1.5V34.6c0-6.2-.3-8.3-1.2-10-.4-.9-1.3-1.5-2.2-1.9-1.5-.7-2.4-.8-6.3-.8h-6.9v34.2c0 .8-.7 1.5-1.5 1.5H9.3c-.8 0-1.5-.6-1.5-1.5V21.9H1c-1.6 0-.9-1.8-.9-1.8l7.2-18C7.8.9 9.2.9 9.2.9h17.7c.8 0 1.5.7 1.5 1.5v17l7-17.3C35.9.9 37.3.9 37.3.9H45c6.5 0 9.5.7 12.9 2.7 1.7 1 3.2 2.3 4.2 3.8 2.3 3 3 6.1 3.1 14.5C67.8 9.2 76.3.8 89 .8c5.6 0 15.3 3.9 15.3 13V2.3c0-.8.7-1.5 1.5-1.5h38.3s1.4 0 1.9 1.2l11 33.8L168 2c.5-1.2 1.9-1.2 1.9-1.2h19.9zm-85.7 27.8c0-4.6-3.7-8.3-8.3-8.3h-3.2c-4.6 0-8.3 3.7-8.3 8.3 0 4.6 3.7 8.3 8.3 8.3h11.5z"
                style={{ fill: '#c30000' }}
            />
        </svg>
    )
}

export async function createFooterHtml({ id }: { id: string }): Promise<string> {
    return toHTML(
        <html>
            <head>
                <style>{headerFooterStyles}</style>
            </head>
            <body>
                <div className="footer">
                    <div id="sykmelding-id">{id}</div>
                    <div>
                        Side <span className="pageNumber"></span> av <span className="totalPages"></span>
                    </div>
                </div>
            </body>
        </html>,
    )
}
