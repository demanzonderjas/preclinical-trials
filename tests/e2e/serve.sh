#!/usr/bin/env bash
# Starts the app for the end-to-end suite. Set PCT_PHP to pick a PHP binary
# (the Laravel 8 app needs PHP 7.4; from the Laravel 13 port on, plain `php`).
set -euo pipefail
cd "$(dirname "$0")/../.."
export APP_ENV=e2e
exec "${PCT_PHP:-php}" -d pcre.jit=0 -d display_errors=stderr -S "localhost:${PCT_E2E_PORT:-8000}" -t public server.php
