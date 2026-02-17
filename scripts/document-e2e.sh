#!/usr/bin/env bash
set -euo pipefail

README="e2e/README.md"
trap 'rm -f "$README.tmp"' EXIT
START="<!-- TESTS:START -->"
END="<!-- TESTS:END -->"

JSON=$(yarn workspace e2e run playwright test --list --project="chromium" --reporter=json)

MD="$(
  jq -r '
    def warn(tests):
      (tests // [] | map(.annotations // [] | any(.type=="fail"))) | any;

    def link(file; title; line):
      "[" + title + "](" +
      "./" + file +
      (if line then "#L\(line)" else "" end) +
      ")";

    def render(s; indent):
      (
        # suite / describe heading
        [indent + "## " + link(s.file; s.title; null)]
        # specs
        + ((s.specs // []) | map(
            (warn(.tests) as $w |
             indent + "* " +
             (if $w then "⚠️ " else "" end) +
             link(.file; .title; .line))
          ))
        # nested describes
        + (if (s.suites // []) | length > 0 then
             (s.suites // [] | map(render(.; indent + "  ")) | add)
           else
             []
           end)
      );

    (.suites // [])
    | if length > 0 then
        (map(render(.; "")) | add)
      else
        []
      end
    | join("\n")
  ' <<<"$JSON"
)"

export __MD="$MD"
awk -v start="$START" -v end="$END" '
  index($0, start) { print start; print ENVIRON["__MD"]; inblock=1; next }
  index($0, end)   { inblock=0; print ""; print end; next }
  !inblock         { print }
' "$README" > "$README.tmp"

mv "$README.tmp" "$README"
