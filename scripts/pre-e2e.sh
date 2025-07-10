#!/usr/bin/env sh

if [ -n "$CI" ]; then
  exit 0
fi

if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/internal/is_alive | grep 200 > /dev/null; then
  printf "\033[0;31m 🔥🔥🔥 Oh no, you have a dev server running on port 3000! This will mess with the e2e tests. :(\033[0m\n"
  exit 1
fi
