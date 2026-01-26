// language=CSS
export const contentCss = `
    html {
        font-family: 'Source Sans 3', sans-serif;
        font-size: 16px;
    }

    h1, h2, h3, h4, h5, h6 {
        margin: 0;
    }

    ul {
        padding-left: 22px;
        margin: 0;
        margin-top: 8px;
    }

    ul > li > ul {
        margin-top: 0;
    }

    .value-container {
        display: grid;
        grid-template-columns: auto auto;
        gap: 32px 16px;
        margin-bottom: 16px;
        margin-left: 10mm;
        margin-right: 10mm;
    }

    .value-item {
        break-inside: avoid;
    }

    .value-item.full {
        grid-column: span 2;
    }

    .value-item.italic > dt {
        font-style: italic;
        color: slategray;
    }

    .value-item dd {
        font-size: 18px;
        font-weight: bold;
    }

    .value-item dt {
        font-size: 0.9rem;
    }

    .value-item dd, .value-item dt {
        padding: 0;
        margin: 0;
    }

    .value-section {
        grid-column: span 2;
    }

    .value-section > .value-items {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .value-section h2 {
        font-size: 18px;
    }

    .value-section dd {
        font-size: 14px;
    }
`
