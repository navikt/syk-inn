#!/usr/bin/env sh

set -e

if nc -z localhost 3000; then
  printf "\033[0;31m 🔥🔥🔥 Oh no, you have a dev server running on port 3000! This dev mode does not support other ports than 3000.\033[0m\n"
  exit 1
fi
