/* eslint-disable @typescript-eslint/no-require-imports */

const { backendLogger } = require('@navikt/next-logger')

module.exports = {
    logger: (config) => backendLogger(config).child({}, { msgPrefix: '[Next] ' }),
}
