# syk-inn

## Local Development

### Prerequisites

(Use mise? `mise i` to install the required prerequisites)

-   [Node.js](https://nodejs.org/en/) v20 (LTS)
-   [Yarn](https://yarnpkg.com/) (`corepack enable`)

This project relies on a Github PAT with `package:read` available as `NPM_AUTH_TOKEN`-environment variable for authenticated access to the Github Package Registry.

### Getting Started

Install dependencies:

```bash
yarn
```

(Once): Start Redis docker image locally:

```bash
yarn dev:redis
```

Alternatively, you can edit ``

Start the development server:

```bash
yarn dev
```
