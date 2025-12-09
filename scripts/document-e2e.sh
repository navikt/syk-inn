#!/usr/bin/env bash
set -euo pipefail

README="e2e/README.md"
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

awk -v start="$START" -v end="$END" -v md="$MD" '
  $0 ~ start { print; print md; inblock=1; next }
  $0 ~ end   { inblock=0; print; next }
  !inblock   { print }
' e2e/README.md > e2e/README.md.tmp

mv e2e/README.md.tmp e2e/README.md
