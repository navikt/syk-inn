#!/usr/bin/env node

/* eslint-disable no-console */

import fs from 'fs'
import path from 'path'

const [, , inputPath] = process.argv

if (!inputPath) {
    console.error('Usage: test-report.mjs <test-results-json>')
    process.exit(1)
}

const raw = fs.readFileSync(inputPath, 'utf8')
const results = JSON.parse(raw)
const project = path.basename(path.dirname(inputPath))

console.info(`## Test Summary: ${project}\n`)

console.info(`- Test Suites: ${results.numPassedTestSuites}/${results.numTotalTestSuites} passed`)
console.info(`- Tests: ${results.numPassedTests}/${results.numTotalTests} passed`)
console.info(`- Failures: ${results.numFailedTests}\n`)

for (const suite of results.testResults) {
    const file = path.relative(process.cwd(), suite.name).replace('src/__tests__/', '')
    console.info(`### ${file}`)
    for (const t of suite.assertionResults) {
        const status = t.status === 'passed' ? '✅' : '❌'
        const duration = t.duration?.toFixed(1) ?? '?'
        console.info(`- ${status} ${t.fullName} — ${duration} ms`)
    }
}
