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

const total = results.numTotalTests ?? 0
const passed = results.numPassedTests ?? 0
const failed = results.numFailedTests ?? 0

console.info(`## Vitest Test Report Summary`)
console.info(`Total tests: ${total}${failed === 0 && total > 0 ? ' ✅' : ''}`)
console.info(`Passed tests: ${passed}${passed > 0 ? ' ✅' : ''}`)
console.info(`Failed tests: ${failed}${failed > 0 ? ' ❌' : ''}\n`)

// List only failures
if (failed > 0 && Array.isArray(results.testResults)) {
    for (const suite of results.testResults) {
        const file = path.relative(process.cwd(), suite.name).replace('src/__tests__/', '')

        // collect failed assertions
        const failures = (suite.assertionResults ?? []).filter((t) => t.status !== 'passed')
        if (failures.length === 0) continue

        console.info(`### ${file}`)
        for (const t of failures) {
            const status = t.status === 'passed' ? '✅' : '❌'
            const duration = Number.isFinite(t.duration) ? `${t.duration.toFixed(1)} ms` : '?'
            console.info(`- ${status} ${t.fullName} — ${duration}`)
        }
    }
}
