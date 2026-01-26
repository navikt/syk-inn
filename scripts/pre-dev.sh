#!/usr/bin/env sh

# This entire script is AI slop, but it works (probably).

set -eu

c_blue="$(printf '\033[34m')"
c_green="$(printf '\033[32m')"
c_yellow="$(printf '\033[33m')"
c_red="$(printf '\033[31m')"
c_reset="$(printf '\033[0m')"

info() { printf "%sℹ️  %s%s\n" "$c_blue" "$*" "$c_reset"; }
ok()   { printf "%s✅ %s%s\n" "$c_green" "$*" "$c_reset"; }
warn() { printf "%s⚠️  %s%s\n" "$c_yellow" "$*" "$c_reset"; }
err()  { printf "%s🔥 %s%s\n" "$c_red" "$*" "$c_reset" >&2; }

need() { command -v "$1" >/dev/null 2>&1 || { err "Missing dependency: $1"; exit 1; }; }

need docker
need jq

# Only manage compose in local runtime env
grep -q '^NEXT_PUBLIC_RUNTIME_ENV=local$' .env.development 2>/dev/null || exit 0

services="$(docker compose config --services 2>/dev/null || true)"
[ -n "${services:-}" ] || { warn "No compose services found (docker compose config --services)"; exit 0; }

# Build a set of running services from docker compose ps json
running_services="$(
  docker compose ps --format json 2>/dev/null \
  | jq -r 'select(.State=="running") | .Service' \
  | sort -u
)"

need_up=0
for s in $services; do
  echo "$running_services" | grep -qx "$s" || { need_up=1; break; }
done

if [ "$need_up" -eq 0 ]; then
  ok "All compose services are running."
  exit 0
fi

info "Starting missing/stopped compose services..."
tmp="${TMPDIR:-/tmp}/pre-dev.$$.log"
: >"$tmp"

# Suppress the ugly compose chatter unless it fails
if docker compose up -d --remove-orphans >"$tmp" 2>&1; then
  ok "Compose stack is up."
  rm -f "$tmp"
else
  err "docker compose up failed:"
  cat "$tmp" >&2
  rm -f "$tmp"
  exit 1
fi
