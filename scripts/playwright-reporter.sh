#!/usr/bin/env bash

report_file="$1"

if [ -z "$report_file" ]; then
  echo "Error: No report file path provided." >&2
  exit 1
fi

if [ ! -f "$report_file" ]; then
  echo "Error: File '$report_file' not found." >&2
  exit 1
fi

total_tests=$(jq '.stats.expected + .stats.unexpected + .stats.flaky' $report_file)
flaky_tests=$(jq '.stats.flaky' $report_file)
passed_tests=$(jq '.stats.expected' $report_file)
failed_tests=$(jq '.stats.unexpected' $report_file)
failed_test_info=$(jq -r '.suites[].specs[] | select(.ok == false) | "\(.title) (\(.file), \(.tests[].projectName))"' $report_file)

echo "## Playwright Test Report Summary"
echo "Total tests: $total_tests ✅"
echo "Passed tests: $passed_tests ✅"

if [ "$flaky_tests" -gt 0 ]; then
  echo "Flaky tests: $flaky_tests ⚠️"
else
  echo "Flaky tests: $flaky_tests 🔹"
fi

if [ "$failed_tests" -gt 0 ]; then
  echo "Failed tests: $failed_tests ❌"
  echo "### Failed Tests:"
  while IFS= read -r test; do
    echo "- $test ❌"
  done <<< "$failed_test_info"
else
  echo "Failed tests: $failed_tests 🔹"
fi


