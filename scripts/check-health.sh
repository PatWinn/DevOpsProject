#!/usr/bin/env sh
set -eu

url="${1:-http://localhost:3000/health}"

printf 'Checking %s\n' "$url"
curl --fail --silent --show-error "$url"
printf '\nHealthcheck passed.\n'
