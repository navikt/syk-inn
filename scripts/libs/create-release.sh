#!/bin/bash
set -o pipefail

PROJECT="$1"
if [ -z "$PROJECT" ]; then
  echo "Usage: $0 <project>"
  exit 1
fi

# Find last tag for this project
LAST_TAG=$(git tag --sort=-creatordate | grep -E "^${PROJECT}-[0-9]+\.[0-9]+\.[0-9]+$" | head -n 1)
if [ -z "$LAST_TAG" ]; then
  echo "No previous tag found for $PROJECT"
  BASE_COMMIT=""
else
  BASE_COMMIT="$LAST_TAG"
fi

SECOND_LINE=$(git log -1 --pretty=format:"%b" | sed -n '2p')

case "$SECOND_LINE" in
  MAJOR) BUMP="major" ;;
  MINOR) BUMP="minor" ;;
  *)     BUMP="patch" ;;
esac


# Parse last version
if [ -z "$LAST_TAG" ]; then
  MAJOR=0; MINOR=0; PATCH=0
else
  VERSION=${LAST_TAG#${PROJECT}-}
  IFS='.' read -r MAJOR MINOR PATCH <<< "$VERSION"
fi

case "$BUMP" in
  major) ((MAJOR++)); MINOR=0; PATCH=0 ;;
  minor) ((MINOR++)); PATCH=0 ;;
  patch) ((PATCH++)) ;;
esac
NEW_VERSION="${MAJOR}.${MINOR}.${PATCH}"
NEW_TAG="${PROJECT}-${NEW_VERSION}"

# Filter commits for this project
RAW_COMMITS=$(git log ${BASE_COMMIT:+$BASE_COMMIT..HEAD} --pretty=format:"%s%n%b%n---" | \
  awk -v proj="^([a-zA-Z]+)(${PROJECT}):" '
    BEGIN { RS="---"; ORS=""; }
    $0 ~ proj { print $0 "\n---\n"; }
  ')

echo "Relevant commits:"
echo "$RAW_COMMITS"

RELEASE_NOTES=$(echo "$RAW_COMMITS" | awk -v proj="^[a-zA-Z]+(${PROJECT}):[[:space:]]*" '
  BEGIN { RS="---"; ORS=""; }
  {
    if ($0 ~ proj) {
      line = $0
      sub(proj, "* ", line)
      print line "\n"
    }
  }
')


echo "Releasing $NEW_TAG"
echo "$RELEASE_NOTES"

git tag "$NEW_TAG"
git push origin "$NEW_TAG"

gh release create "$NEW_TAG" -t "$NEW_TAG" -n "$RELEASE_NOTES"

if [ -n "$GITHUB_STEP_SUMMARY" ]; then
  {
    echo "## Release $NEW_TAG"
    echo ""
    echo "$RELEASE_NOTES"
  } >> "$GITHUB_STEP_SUMMARY"
fi
