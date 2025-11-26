/* eslint-disable no-console */

import { Readable } from 'node:stream'

export function streamToStdout(stream: Readable): void {
    stream.on('data', (line) => console.log(line))
    stream.on('err', (line) => console.error(line))
    stream.on('end', () => console.log('Stream closed'))
}
