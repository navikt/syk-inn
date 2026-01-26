/**
 * These styles are isolated in Gotenberg, and won't conflict with other styles.
 */

// language=CSS
export const headerFooterStyles = `
    html {
        font-family: 'Source Sans 3', sans-serif;
        -webkit-print-color-adjust: exact;
    }

    .header {
        position: absolute;
        top: 0;
        width: 100%;
        font-size: 22px;
        background-color: #E6F0FF;
        padding: 0.65cm 0.65cm 0.65cm 2cm;
        display: flex;
    }

    .header h1 {
        font-size: 22px;
        padding: 0;
        margin: 0 0;
        font-weight: bold;
    }

    .header svg {
        width: 64px;
        margin-right: 32px;
    }

    .footer {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        margin: auto 20px 0;
    }
    
    .footer #sykmelding-id {
        color: gray;
    }
`
