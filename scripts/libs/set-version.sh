#!/bin/bash
set -eo pipefail

PROJECT="$1"
if [ -z "$PROJECT" ]; then
  echo "Usage: $0 <project>"
  exit 1
fi

TAG=$(git tag --sort=-creatordate | grep -E "^${PROJECT}-[0-9]+\.[0-9]+\.[0-9]+$" | head -n 1)
if [ -z "$TAG" ]; then
  echo "No tag found for $PROJECT"
  exit 1
fi

VERSION=${TAG#${PROJECT}-}
PKG_PATH="libs/$PROJECT/package.json"

if [ ! -f "$PKG_PATH" ]; then
  echo "No package.json found at $PKG_PATH"
  exit 1
fi

jq --arg v "$VERSION" '.version = $v' "$PKG_PATH" > "$PKG_PATH.tmp" && mv "$PKG_PATH.tmp" "$PKG_PATH"
echo "Set version $VERSION in $PKG_PATH"

npx prettier --write "$PKG_PATH"

