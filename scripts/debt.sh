#!/usr/bin/env bash

todo=$(grep -roh "TODO" src | wc -w)
e2eTodo=$(grep -roh "TODO" e2e | wc -w)
e2eFails=$(grep -roh "test.fail" e2e | wc -w)


echo "## Technical Debt"
echo
echo "* $todo TODOs in src"
echo "* $e2eTodo TODOs in e2e"
echo "* $e2eFails 'test.fail(...)' tests in e2e"
