#!/usr/bin/env bash

# Deno is not happy in the docker environment when workspaces are defined and not available
jq 'del(.workspaces)' .next/standalone/package.json > tmp.json && mv tmp.json .next/standalone/package.json
